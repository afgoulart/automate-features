import axios, { AxiosInstance } from 'axios';
import { GeneratorConfig } from '../types';

/**
 * Integration with Cursor API for code generation
 */
export class CursorAPI {
  private apiClient: AxiosInstance;

  constructor(apiToken: string) {
    if (!apiToken) {
      throw new Error('Cursor API token is required');
    }

    this.apiClient = axios.create({
      baseURL: process.env.CURSOR_API_URL || 'https://api.cursor.sh/v1',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60 seconds
    });
  }

  /**
   * Generate code from a prompt
   */
  async generateCode(prompt: string, config?: GeneratorConfig): Promise<string> {
    try {
      const response = await this.apiClient.post('/generate', {
        prompt,
        language: config?.language || 'typescript',
        framework: config?.framework,
        context: config?.context,
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
