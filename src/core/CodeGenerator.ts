import { GeneratedCode, GeneratorConfig } from '../types';
import { CursorAPI } from '../integrations/CursorAPI';

/**
 * Code generator using Cursor API
 */
export class CodeGenerator {
  private cursorAPI: CursorAPI;

  constructor(cursorApiToken: string) {
    this.cursorAPI = new CursorAPI(cursorApiToken);
  }

  /**
   * Generate code from a prompt
   */
  async generate(prompt: string, config?: GeneratorConfig): Promise<GeneratedCode> {
    try {
      const code = await this.cursorAPI.generateCode(prompt, config);

      return {
        code,
        language: config?.language || 'typescript',
        filePath: this.suggestFilePath(prompt, config),
      };
    } catch (error) {
      throw new Error(
        `Failed to generate code: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Suggest a file path based on prompt and config
   */
  private suggestFilePath(prompt: string, config?: GeneratorConfig): string | undefined {
    // Simple implementation - can be enhanced with more intelligent path suggestion
    if (config?.framework === 'react' || prompt.toLowerCase().includes('component')) {
      return 'src/components/GeneratedComponent.tsx';
    }
    if (prompt.toLowerCase().includes('api') || prompt.toLowerCase().includes('route')) {
      return 'src/api/routes.ts';
    }
    return 'src/generated.ts';
  }
}
