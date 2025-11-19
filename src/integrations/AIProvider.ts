/**
 * Interface for AI code generation providers
 */
export interface AIProvider {
  /**
   * Generate code from a prompt
   */
  generateCode(prompt: string, config?: GeneratorConfig): Promise<string>;

  /**
   * Validate API connection
   */
  validateConnection(): Promise<boolean>;
}

/**
 * Configuration for code generation
 */
export interface GeneratorConfig {
  /** Programming language to generate */
  language?: string;
  /** Framework/library to use */
  framework?: string;
  /** Additional context for code generation */
  context?: string;
}

/**
 * Supported AI provider types
 */
export type AIProviderType = 'CURSOR' | 'CLAUDE_CODE' | 'GEMINI';
