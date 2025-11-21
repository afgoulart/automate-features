/**
 * Type definitions for Rust bindings
 * These types match the Rust NAPI exports
 */

export interface GenerateCodeRequest {
  prompt: string;
  providerType?: string; // camelCase for NAPI
  provider_type?: string; // snake_case fallback
  apiKey?: string; // camelCase for NAPI
  api_key?: string; // snake_case fallback
  sourceDir?: string; // camelCase for NAPI
  source_dir?: string; // snake_case fallback
  language?: string;
  framework?: string;
  context?: string;
}

export interface GenerateCodeResponse {
  code: string;
  success: boolean;
  error?: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */

import * as path from 'path';
import * as fs from 'fs';

/**
 * Rust module bindings
 * This will be loaded from the compiled Rust binary
 */
let rustModule: any = null;

/**
 * Load Rust module dynamically
 */
async function loadRustModule(): Promise<any> {
  if (rustModule) {
    return rustModule;
  }

  // Try to load from different possible locations
  // __dirname in dist will be dist/integrations, so we need to go up to project root
  const projectRoot = path.resolve(__dirname, '../../..');
  const possiblePaths = [
    // First try the bundled binary in dist/native (for npm packages)
    path.resolve(__dirname, '../native/automate_features_rust.node'),
    path.resolve(__dirname, '../../native/automate_features_rust.node'),
    path.resolve(process.cwd(), 'dist/native/automate_features_rust.node'),
    // Then try the development locations
    path.resolve(projectRoot, 'rust/target/release/automate_features_rust.node'),
    path.resolve(process.cwd(), 'rust/target/release/automate_features_rust.node'),
    path.resolve(__dirname, '../../rust/target/release/automate_features_rust.node'),
    path.resolve(__dirname, '../../../rust/target/release/automate_features_rust.node'),
    path.resolve(process.cwd(), 'rust/target/release/libautomate_features_rust.dylib'), // macOS fallback
    './rust/target/release/automate_features_rust.node',
    '../rust/target/release/automate_features_rust.node',
    '../../rust/target/release/automate_features_rust.node',
  ];

  let lastError: Error | null = null;

  for (const modulePath of possiblePaths) {
    try {
      const resolvedPath = path.isAbsolute(modulePath)
        ? modulePath
        : path.resolve(process.cwd(), modulePath);

      // Check if file exists
      if (!fs.existsSync(resolvedPath)) {
        continue;
      }

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      rustModule = require(resolvedPath);
      console.log(`✅ Rust module loaded from: ${resolvedPath}`);
      return rustModule;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      continue;
    }
  }

  // If we get here, module wasn't found
  const errorMsg = lastError
    ? `Rust module not found. Last error: ${lastError.message}. Please build it first: npm run build:rust`
    : 'Rust module not found. Please build it first: npm run build:rust';

  throw new Error(errorMsg);
}

/**
 * Collect source code from project directory
 */
export async function collectSourceCode(sourceDir: string): Promise<string> {
  const module = await loadRustModule();
  return module.collectSourceCode(sourceDir);
}

/**
 * Generate code using CLI (Cursor or Claude Code)
 */
export async function generateCodeCli(request: GenerateCodeRequest): Promise<GenerateCodeResponse> {
  const module = await loadRustModule();

  // Convert to camelCase for NAPI (Rust will accept both via serde alias)
  const sanitizedRequest: any = {
    prompt: request.prompt || '',
    providerType: request.providerType || request.provider_type || '',
    // apiKey: request.apiKey || request.api_key || '',
    sourceDir: request.sourceDir || request.source_dir,
    language: request.language,
    framework: request.framework,
    context: request.context,
  };

  console.log('[rust-bindings] Calling Rust with:', JSON.stringify(sanitizedRequest, null, 2));

  try {
    const result = await module.generateCodeCli(sanitizedRequest);
    console.log('[rust-bindings] Rust returned:', {
      success: result.success,
      hasCode: !!result.code,
      error: result.error,
    });
    return result;
  } catch (error) {
    console.error('[rust-bindings] Error calling Rust:', error);
    throw error;
  }
}

/**
 * Check if CLI is available
 */
export async function checkCliAvailable(providerType: string): Promise<boolean> {
  const module = await loadRustModule();
  return module.checkCliAvailable(providerType);
}
