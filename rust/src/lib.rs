use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tokio::process::Command as AsyncCommand;
use ignore::WalkBuilder;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct GenerateCodeRequest {
    pub prompt: String,
    #[serde(alias = "provider_type")]
    pub provider_type: String, // "CURSOR" or "CLAUDE_CODE" - accepts both "providerType" (camelCase) and "provider_type" (snake_case)
    #[serde(alias = "api_key")]
    pub api_key: String, // accepts both "apiKey" and "api_key"
    #[serde(alias = "source_dir")]
    pub source_dir: Option<String>, // accepts both "sourceDir" and "source_dir"
    pub language: Option<String>,
    pub framework: Option<String>,
    pub context: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct GenerateCodeResponse {
    pub code: String,
    pub success: bool,
    pub error: Option<String>,
}

/// Collect source code from project directory
#[napi]
pub async fn collect_source_code(source_dir: String) -> napi::Result<String> {
    let source_path = PathBuf::from(&source_dir);
    
    if !source_path.exists() {
        return Err(napi::Error::from_reason(format!(
            "Source directory does not exist: {}",
            source_dir
        )));
    }

    let mut files = Vec::new();
    let walker = WalkBuilder::new(&source_path)
        .standard_filters(true)
        .git_ignore(true)
        .git_exclude(true)
        .build();

    for result in walker {
        let entry = result.map_err(|e| {
            napi::Error::from_reason(format!("Walkdir error: {}", e))
        })?;
        
        let path = entry.path();
        if path.is_file() {
            // Only collect code files
            if let Some(ext) = path.extension() {
                let ext_str = ext.to_string_lossy().to_lowercase();
                if matches!(ext_str.as_str(), "ts" | "tsx" | "js" | "jsx" | "rs" | "py" | "go" | "java" | "cpp" | "c" | "h") {
                    match std::fs::read_to_string(path) {
                        Ok(content) => {
                            let relative_path = path.strip_prefix(&source_path)
                                .unwrap_or(path)
                                .to_string_lossy()
                                .to_string();
                            files.push(format!("// File: {}\n{}\n", relative_path, content));
                        }
                        Err(e) => {
                            eprintln!("Warning: Could not read file {}: {}", path.display(), e);
                        }
                    }
                }
            }
        }
    }

    Ok(files.join("\n---\n\n"))
}

/// Execute Cursor CLI to generate code
async fn execute_cursor_cli(
    prompt: &str,
    api_key: &str,
    source_context: Option<&str>,
) -> napi::Result<String> {
    let mut command = AsyncCommand::new("cursor");
    
    // Build command with context
    let mut full_prompt = prompt.to_string();
    if let Some(context) = source_context {
        full_prompt = format!(
            "Context from project:\n{}\n\nUser request: {}",
            context, prompt
        );
    }

    command
        .arg("generate")
        .arg("--prompt")
        .arg(&full_prompt)
        .env("CURSOR_API_KEY", api_key);

    let output = command
        .output()
        .await
        .map_err(|e| {
            napi::Error::from_reason(format!("Failed to execute cursor CLI: {}", e))
        })?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(napi::Error::from_reason(format!(
            "Cursor CLI failed: {}",
            stderr
        )));
    }

    let stdout = String::from_utf8(output.stdout)
        .map_err(|e| {
            napi::Error::from_reason(format!("Invalid UTF-8 in output: {}", e))
        })?;

    Ok(stdout)
}

/// Execute Claude Code CLI with source context
async fn execute_claude_cli(
    prompt: &str,
    api_key: &str,
    source_dir: Option<&str>,
) -> napi::Result<String> {
    // Claude CLI has direct access to project files, so we don't need to pass context
    // This also prevents timeouts from large context payloads
    let full_prompt = prompt.to_string();

    eprintln!("[Rust] Calling Claude CLI with prompt length: {} characters", full_prompt.len());

    // Determine working directory (use source_dir if provided, otherwise current dir)
    let working_dir = source_dir.unwrap_or(".");
    eprintln!("[Rust] Claude CLI working directory: {}", working_dir);

    // Try to find claude in common locations
    let claude_path = if std::path::Path::new("/Users/msc/.local/bin/claude").exists() {
        "/Users/msc/.local/bin/claude"
    } else if std::path::Path::new("/usr/local/bin/claude").exists() {
        "/usr/local/bin/claude"
    } else {
        // Fallback to just "claude" and hope it's in PATH
        "claude"
    };

    eprintln!("[Rust] Using Claude CLI at: {}", claude_path);

    // Use claude CLI with --print flag for non-interactive output
    // --dangerously-skip-permissions allows automatic code generation without prompts
    let mut command = AsyncCommand::new(claude_path);
    command
        .current_dir(working_dir)  // Set working directory to source dir
        .arg("--print")
        .arg("--output-format")
        .arg("text")
        .arg("--model")
        .arg("sonnet")
        .arg("--dangerously-skip-permissions")
        .arg("--system-prompt")
        .arg("You are an expert software developer. Generate complete, production-ready code following best practices. Return ONLY the code implementation without asking for permissions or confirmations. Generate all necessary files and code directly.")
        .arg(full_prompt)
        .env("ANTHROPIC_API_KEY", api_key);

    let output = command
        .output()
        .await
        .map_err(|e| {
            napi::Error::from_reason(format!("Failed to execute claude CLI: {}", e))
        })?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(napi::Error::from_reason(format!(
            "Claude CLI failed: {}",
            stderr
        )));
    }

    let stdout = String::from_utf8(output.stdout)
        .map_err(|e| {
            napi::Error::from_reason(format!("Invalid UTF-8 in output: {}", e))
        })?;

    eprintln!("[Rust] Successfully received response from Claude CLI");

    Ok(stdout)
}

/// Generate code using CLI (Cursor or Claude Code)
#[napi]
pub async fn generate_code_cli(request: GenerateCodeRequest) -> napi::Result<GenerateCodeResponse> {
    // Debug: Log received request
    eprintln!("[Rust] Received request: provider_type={}, api_key_len={}, source_dir={:?}", 
        request.provider_type, 
        request.api_key.len(),
        request.source_dir
    );
    
    // Validate required fields
    if request.provider_type.is_empty() {
        return Ok(GenerateCodeResponse {
            code: String::new(),
            success: false,
            error: Some("provider_type is required".to_string()),
        });
    }
    
    if request.api_key.is_empty() {
        return Ok(GenerateCodeResponse {
            code: String::new(),
            success: false,
            error: Some("api_key is required".to_string()),
        });
    }
    
    // Collect source code if source_dir is provided
    let source_context = if let Some(source_dir) = &request.source_dir {
        match collect_source_code(source_dir.clone()).await {
            Ok(context) => Some(context),
            Err(e) => {
                eprintln!("Warning: Could not collect source code: {}", e);
                None
            }
        }
    } else {
        None
    };

    // Execute appropriate CLI based on provider type
    let code = match request.provider_type.to_uppercase().as_str() {
        "CURSOR" => execute_cursor_cli(&request.prompt, &request.api_key, source_context.as_deref()).await?,
        "CLAUDE_CODE" | "CLAUDE" => execute_claude_cli(&request.prompt, &request.api_key, request.source_dir.as_deref()).await?,
        _ => {
            return Ok(GenerateCodeResponse {
                code: String::new(),
                success: false,
                error: Some(format!("Unsupported provider type: {}", request.provider_type)),
            });
        }
    };

    Ok(GenerateCodeResponse {
        code,
        success: true,
        error: None,
    })
}

/// Check if CLI is available
#[napi]
pub async fn check_cli_available(provider_type: String) -> napi::Result<bool> {
    match provider_type.to_uppercase().as_str() {
        "CURSOR" => {
            // Check if cursor CLI is installed
            let output = AsyncCommand::new("which")
                .arg("cursor")
                .output()
                .await;

            match output {
                Ok(output) => Ok(output.status.success()),
                Err(_) => Ok(false),
            }
        }
        "CLAUDE_CODE" | "CLAUDE" => {
            // Claude Code uses API directly, no CLI needed
            // Always return true since it's API-based
            Ok(true)
        }
        _ => Ok(false),
    }
}

