import axios, { AxiosInstance } from 'axios';
import { AIProvider, GeneratorConfig } from '../AIProvider';

/**
 * Claude Code AI provider implementation
 */
export class ClaudeCodeProvider implements AIProvider {
  private apiClient: AxiosInstance;

  constructor(apiKey: string, apiUrl?: string) {
    if (!apiKey) {
      throw new Error('Claude Code API key is required');
    }

    // Prioridade: parâmetro > PROMPT_API_URL env > CLAUDE_CODE_API_URL env > padrão
    const baseURL =
      apiUrl ||
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
   * Generate code from a prompt
   */
  async generateCode(prompt: string, config?: GeneratorConfig): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(config);

      const response = await this.apiClient.post('/messages', {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      if (response.data && response.data.content && response.data.content.length > 0) {
        // Extract code from Claude's response
        const content = response.data.content[0].text;
        return this.extractCode(content);
      }

      throw new Error('Invalid response from Claude Code API');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorDetails = error.response?.data
          ? JSON.stringify(error.response.data)
          : error.message;
        const statusCode = error.response?.status || 'unknown';
        throw new Error(
          `Claude Code API error (${statusCode}): ${errorDetails}`
        );
      }
      throw error;
    }
  }

  /**
   * Validate API connection
   */
  async validateConnection(): Promise<boolean> {
    try {
      // Claude API doesn't have a health endpoint, so we'll do a simple test
      await this.apiClient.get('/models');
      return true;
    } catch (error) {
      // If we get a 401/403, the key is invalid, otherwise connection might be OK
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        return status >= 400 && status < 500; // Auth errors mean API is reachable
      }
      return false;
    }
  }

  /**
   * Build system prompt based on configuration
   */
  private buildSystemPrompt(config?: GeneratorConfig): string {
    let prompt = `You are an expert code generator. Generate clean, production-ready code following best practices.

When generating multiple files, use this format for EACH file:

## File: path/to/file.ext
\`\`\`language
// file content here
\`\`\`

For example:
## File: src/components/Button.tsx
\`\`\`tsx
export const Button = () => { ... }
\`\`\`

## File: src/components/Button.test.tsx
\`\`\`tsx
describe('Button', () => { ... })
\`\`\`

Important:
- Use complete file paths (e.g., src/components/Button.tsx, not just Button.tsx)
- Include all necessary files (components, tests, types, configs, etc.)
- Follow project structure conventions`;

    if (config?.language) {
      prompt += `\n- Use ${config.language} as the primary programming language`;
    }

    if (config?.framework) {
      prompt += `\n- Use ${config.framework} framework`;
    }

    if (config?.context) {
      prompt += `\n- Additional context: ${config.context}`;
    }

    return prompt;
  }

  /**
   * Extract code from Claude's response
   */
  private extractCode(content: string): string {
    // Try to extract code from markdown code blocks
    const codeBlockRegex = /```(?:typescript|javascript|ts|js|tsx|jsx)?\n([\s\S]*?)```/;
    const match = content.match(codeBlockRegex);

    if (match && match[1]) {
      return match[1].trim();
    }

    // If no code block found, return the content as-is
    return content.trim();
  }
}
