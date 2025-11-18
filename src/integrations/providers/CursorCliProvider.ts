import { AIProvider, GeneratorConfig } from '../AIProvider';
import axios, { AxiosInstance } from 'axios';
import * as rust from '../rust-bindings';

/**
 * Cursor provider with source context support
 * Uses HTTP API but includes source code context from the project
 */
export class CursorCliProvider implements AIProvider {
  private apiClient: AxiosInstance;
  private sourceDir?: string;

  constructor(apiToken: string, sourceDir?: string) {
    if (!apiToken) {
      throw new Error('Cursor API token is required');
    }
    this.sourceDir = sourceDir;

    const baseURL =
      process.env.PROMPT_API_URL ||
      process.env.CURSOR_API_URL ||
      'https://api.cursor.sh/v1';

    this.apiClient = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60 seconds
    });
  }

  /**
   * Generate code from a prompt using Cursor API with source context
   */
  async generateCode(prompt: string, config?: GeneratorConfig): Promise<string> {
    try {
      console.log('🔧 Using Cursor API with source context');
      
      // Collect source code if sourceDir is provided
      let sourceContext: string | undefined;
      if (this.sourceDir) {
        try {
          console.log(`📁 Collecting source code from: ${this.sourceDir}`);
          sourceContext = await rust.collectSourceCode(this.sourceDir);
          console.log(`✅ Collected ${sourceContext.length} characters of source code`);
        } catch (error) {
          console.warn(`⚠️  Could not collect source code: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Build prompt with context
      let fullPrompt = prompt;
      if (sourceContext) {
        fullPrompt = `Context from project:\n${sourceContext}\n\nUser request: ${prompt}`;
      }

      // Use HTTP API with enhanced prompt
      console.log(`🌐 Calling Cursor API at: ${this.apiClient.defaults.baseURL}/generate`);
      const response = await this.apiClient.post('/generate', {
        prompt: fullPrompt,
        language: config?.language || 'typescript',
        framework: config?.framework,
        context: config?.context,
      }).catch((error) => {
        if (axios.isAxiosError(error) && error.code === 'ENOTFOUND') {
          throw new Error(
            `Cursor API endpoint not found (${this.apiClient.defaults.baseURL}). ` +
            `The Cursor API may not be publicly available. ` +
            `Try using Claude Code instead: PROMPT_AI_TYPE=CLAUDE_CODE`
          );
        }
        throw error;
      });

      if (response.data && response.data.code) {
        return response.data.code;
      }

      throw new Error('Invalid response from Cursor API');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Cursor API error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Validate API connection
   */
  async validateConnection(): Promise<boolean> {
    try {
      await this.apiClient.get('/health');
      return true;
    } catch {
      return false;
    }
  }
}

