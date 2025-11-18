import { AIProvider, GeneratorConfig } from '../AIProvider';
import axios, { AxiosInstance } from 'axios';
import * as rust from '../rust-bindings';

/**
 * Claude Code provider with source context support
 * Uses HTTP API but includes source code context from the project
 */
export class ClaudeCodeCliProvider implements AIProvider {
  private apiClient: AxiosInstance;
  private sourceDir?: string;
  private apiKey: string;

  constructor(apiKey: string, sourceDir?: string) {
    if (!apiKey) {
      throw new Error('Claude Code API key is required');
    }
    this.apiKey = apiKey;
    this.sourceDir = sourceDir;

    const baseURL =
      process.env.PROMPT_API_URL ||
      process.env.CLAUDE_CODE_API_URL ||
      'https://api.anthropic.com/v1';

    this.apiClient = axios.create({
      baseURL,
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60 seconds
    });
  }

  /**
   * Generate code from a prompt using Claude CLI or API with source context
   */
  async generateCode(prompt: string, config?: GeneratorConfig): Promise<string> {
    // Always try to use Rust CLI first when in CLI mode
    console.log('🔧 Attempting to use Claude Code CLI via Rust module');
    
    // Get API key from constructor or env
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      throw new Error('Claude Code API key is required');
    }

    try {
      const result = await rust.generateCodeCli({
        prompt: prompt,
        providerType: 'CLAUDE_CODE',
        apiKey: apiKey,
        sourceDir: this.sourceDir,
        language: config?.language,
        framework: config?.framework,
        context: config?.context,
      });

      if (result.success && result.code) {
        console.log('✅ Code generated using Claude Code CLI');
        return result.code;
      }

      // If CLI failed, throw error instead of falling back to API
      const errorMsg = result.error || 'Claude Code CLI failed';
      throw new Error(`Claude Code CLI error: ${errorMsg}`);
    } catch (error) {
      // If it's a CLI-specific error, throw it
      if (error instanceof Error && error.message.includes('CLI')) {
        throw error;
      }
      
      // Check if CLI is available and provide helpful error message
      let cliAvailable = false;
      try {
        cliAvailable = await rust.checkCliAvailable('CLAUDE_CODE');
      } catch (checkError) {
        // Ignore check errors
        console.warn('⚠️ Unable to verify Claude Code CLI availability:', checkError);
      }
      
      if (!cliAvailable) {
        throw new Error(
          'Claude CLI (claude) is not installed or not in PATH. ' +
          'Install it with: brew install --cask claude or curl -fsSL https://claude.ai/install.sh | bash ' +
          'To use HTTP API mode instead, remove USE_CLI=true from your command.'
        );
      }
      
      // Re-throw original error with more context
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        `Failed to execute Claude Code CLI: ${errorMsg}. ` +
        `Make sure the CLI is installed and ANTHROPIC_API_KEY is set correctly.`
      );
    }
  }

  /**
   * Get API key
   */
  private getApiKey(): string {
    return this.apiKey;
  }

  /**
   * Validate API connection
   */
  async validateConnection(): Promise<boolean> {
    try {
      await this.apiClient.get('/models');
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        return status >= 400 && status < 500; // Auth errors mean API is reachable
      }
      return false;
    }
  }
}

