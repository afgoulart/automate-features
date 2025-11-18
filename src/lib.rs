use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::Command;
use tokio::process::Command as AsyncCommand;
use walkdir::WalkDir;
use ignore::WalkBuilder;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct GenerateCodeRequest {
    pub prompt: String,
    pub provider_type: String, // "CURSOR" or "CLAUDE_CODE"
    pub api_key: String,
    pub source_dir: Option<String>,
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
pub async fn collect_source_code(source_dir: String) -> Result<String, napi::Error> {
    let source_path = PathBuf::from(&source_dir);
    
    if !source_path.exists() {
        return Err(napi::Error::from_reason(format!("Source directory does not exist: {}", source_dir)));
    }

    let mut files = Vec::new();
    let walker = WalkBuilder::new(&source_path)
        .standard_filters(true)
        .git_ignore(true)
        .git_exclude(true)
        .build();

    for result in walker {
        let entry = result.map_err(|e| napi::Error::from_reason(format!("Walkdir error: {}", e)))?;
        
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
) -> Result<String, napi::Error> {
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
        .map_err(|e| napi::Error::from_reason(format!("Failed to execute cursor CLI: {}", e)))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(napi::Error::from_reason(format!(
            "Cursor CLI failed: {}",
            stderr
        )));
    }

    let stdout = String::from_utf8(output.stdout)
        .map_err(|e| napi::Error::from_reason(format!("Invalid UTF-8 in output: {}", e)))?;

    Ok(stdout)
}

/// Execute Claude Code CLI to generate code
async fn execute_claude_cli(
    prompt: &str,
    api_key: &str,
    source_context: Option<&str>,
) -> Result<String, napi::Error> {
    let mut command = AsyncCommand::new("claude");
    
    // Build command with context
    let mut full_prompt = prompt.to_string();
    if let Some(context) = source_context {
        full_prompt = format!(
            "Context from project:\n{}\n\nUser request: {}",
            context, prompt
        );
    }

    command
        .arg("--prompt")
        .arg(&full_prompt)
        .env("ANTHROPIC_API_KEY", api_key);

    let output = command
        .output()
        .await
        .map_err(|e| napi::Error::from_reason(format!("Failed to execute claude CLI: {}", e)))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(napi::Error::from_reason(format!(
            "Claude Code CLI failed: {}",
            stderr
        )));
    }

    let stdout = String::from_utf8(output.stdout)
        .map_err(|e| napi::Error::from_reason(format!("Invalid UTF-8 in output: {}", e)))?;

    Ok(stdout)
}

/// Generate code using CLI (Cursor or Claude Code)
#[napi]
pub async fn generate_code_cli(request: GenerateCodeRequest) -> Result<GenerateCodeResponse, napi::Error> {
    // Collect source code if source_dir is provided
    let source_context = if let Some(ref source_dir) = request.source_dir {
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
        "CLAUDE_CODE" | "CLAUDE" => execute_claude_cli(&request.prompt, &request.api_key, source_context.as_deref()).await?,
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
pub async fn check_cli_available(provider_type: String) -> Result<bool, napi::Error> {
    let cli_name = match provider_type.to_uppercase().as_str() {
        "CURSOR" => "cursor",
        "CLAUDE_CODE" | "CLAUDE" => "claude-code",
        _ => return Ok(false),
    };

    let output = AsyncCommand::new("which")
        .arg(cli_name)
        .output()
        .await;

    match output {
        Ok(output) => Ok(output.status.success()),
        Err(_) => Ok(false),
    }
}

