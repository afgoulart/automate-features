import { GeneratedCode, GeneratorConfig } from '../types';
import { AIProvider } from '../integrations/AIProvider';
import { AIProviderFactory } from '../integrations/AIProviderFactory';
import { CodeParser, ParsedFile } from './CodeParser';

/**
 * Code generator using AI providers (abstracted)
 */
export class CodeGenerator {
  private aiProvider: AIProvider;

  constructor(
    aiProviderOrToken?: AIProvider | string,
    apiUrl?: string,
    useCli: boolean = false,
    sourceDir?: string,
    aiProviderType?: 'CURSOR' | 'CLAUDE_CODE'
  ) {
    console.log(
      `[CodeGenerator] Constructor called with useCli=${useCli}, sourceDir=${sourceDir}, aiProviderType=${aiProviderType}`
    );

    if (!aiProviderOrToken) {
      // Try to create from environment variables
      console.log('[CodeGenerator] Creating provider from environment variables');
      this.aiProvider = AIProviderFactory.createFromEnv(apiUrl, useCli, sourceDir);
    } else if (typeof aiProviderOrToken === 'string') {
      // Use provided type, or fallback to env var, or default to CURSOR
      let providerTypeStr = aiProviderType || process.env.PROMPT_AI_TYPE || 'CURSOR';

      // Normalize common typos before converting to type
      providerTypeStr = providerTypeStr
        .toUpperCase()
        .replace('CLOUD_CODE', 'CLAUDE_CODE')
        .replace('CLOUD', 'CLAUDE')
        .replace('COURSOR', 'CURSOR');

      const providerType = (providerTypeStr === 'CLAUDE_CODE' ? 'CLAUDE_CODE' : 'CURSOR') as
        | 'CURSOR'
        | 'CLAUDE_CODE';

      console.log(`[CodeGenerator] Creating provider with type=${providerType}, useCli=${useCli}`);
      this.aiProvider = AIProviderFactory.create(
        providerType,
        aiProviderOrToken,
        apiUrl,
        useCli,
        sourceDir
      );
    } else {
      // AIProvider instance provided
      console.log('[CodeGenerator] Using provided AIProvider instance');
      this.aiProvider = aiProviderOrToken;
    }

    console.log(`[CodeGenerator] Provider type: ${this.aiProvider.constructor.name}`);
  }

  /**
   * Generate code from a prompt
   */
  async generate(prompt: string, config?: GeneratorConfig): Promise<GeneratedCode> {
    try {
      const code = await this.aiProvider.generateCode(prompt, config);

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
   * Generate code and parse into multiple files
   */
  async generateAndParse(
    prompt: string,
    config?: GeneratorConfig
  ): Promise<{ code: string; files: ParsedFile[] }> {
    try {
      const code = await this.aiProvider.generateCode(prompt, config);
      const parseResult = CodeParser.parse(code);

      console.log(CodeParser.getSummary(parseResult));

      return {
        code,
        files: parseResult.files,
      };
    } catch (error) {
      throw new Error(
        `Failed to generate and parse code: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate code, parse, and write files to disk
   */
  async generateAndWrite(
    prompt: string,
    baseDir: string,
    config?: GeneratorConfig
  ): Promise<ParsedFile[]> {
    try {
      const { files } = await this.generateAndParse(prompt, config);

      console.log(`\n📝 Writing ${files.length} file(s) to ${baseDir}...\n`);
      await CodeParser.writeFiles(files, baseDir);

      return files;
    } catch (error) {
      throw new Error(
        `Failed to generate and write files: ${error instanceof Error ? error.message : 'Unknown error'}`
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
