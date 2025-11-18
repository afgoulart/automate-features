import { AIProvider, AIProviderType } from './AIProvider';
import { CursorProvider } from './providers/CursorProvider';
import { ClaudeCodeProvider } from './providers/ClaudeCodeProvider';
import { CursorCliProvider } from './providers/CursorCliProvider';
import { ClaudeCodeCliProvider } from './providers/ClaudeCodeCliProvider';

/**
 * Factory for creating AI providers
 */
export class AIProviderFactory {
  /**
   * Create an AI provider based on type
   * @param type - AI provider type (CURSOR, CLAUDE_CODE)
   * @param apiKey - API key/token for the provider
   * @param apiUrl - Optional API URL (overrides env vars and defaults)
   * @param useCli - Whether to use CLI instead of HTTP API (default: false)
   * @param sourceDir - Source directory for CLI context (only used with CLI mode)
   */
  static create(
    type: AIProviderType,
    apiKey: string,
    apiUrl?: string,
    useCli: boolean = false,
    sourceDir?: string
  ): AIProvider {
    console.log(
      `[AIProviderFactory] create called: type=${type}, useCli=${useCli}, sourceDir=${sourceDir}`
    );

    // Use CLI providers if useCli is true
    if (useCli) {
      console.log(`[AIProviderFactory] Creating CLI provider for ${type}`);
      switch (type) {
        case 'CURSOR':
          return new CursorCliProvider(apiKey, sourceDir);

        case 'CLAUDE_CODE':
          return new ClaudeCodeCliProvider(apiKey, sourceDir);

        default:
          throw new Error(`Unsupported AI provider type: ${type}`);
      }
    }

    // Use HTTP API providers (default)
    console.log(`[AIProviderFactory] Creating HTTP API provider for ${type}`);
    switch (type) {
      case 'CURSOR':
        return new CursorProvider(apiKey, apiUrl);

      case 'CLAUDE_CODE':
        return new ClaudeCodeProvider(apiKey, apiUrl);

      default:
        throw new Error(`Unsupported AI provider type: ${type}`);
    }
  }

  /**
   * Create an AI provider from environment variables
   */
  static createFromEnv(apiUrl?: string, useCli: boolean = false, sourceDir?: string): AIProvider {
    const providerType = (process.env.PROMPT_AI_TYPE || 'CURSOR').toUpperCase() as AIProviderType;

    // PROMPT_AI_KEY é a variável única que funciona para qualquer tipo de AI
    // Para Claude Code, também aceita ANTHROPIC_API_KEY (padrão da Anthropic)
    let apiKey = process.env.PROMPT_AI_KEY || process.env.CURSOR_API_TOKEN || '';

    // Se for CLAUDE_CODE e não tiver PROMPT_AI_KEY, tenta ANTHROPIC_API_KEY
    if (!apiKey && providerType === 'CLAUDE_CODE') {
      apiKey = process.env.ANTHROPIC_API_KEY || '';
    }

    if (!apiKey) {
      const errorMsg =
        providerType === 'CLAUDE_CODE'
          ? 'API key is required for Claude Code. Set PROMPT_AI_KEY or ANTHROPIC_API_KEY environment variable.'
          : 'PROMPT_AI_KEY environment variable is required. ' +
            'Set PROMPT_AI_TYPE to CURSOR or CLAUDE_CODE and provide PROMPT_AI_KEY with the API key/token.';
      throw new Error(errorMsg);
    }

    // Check if CLI mode should be used
    const useCliMode = useCli || process.env.USE_CLI === 'true' || process.env.USE_CLI === '1';
    const sourceDirectory = sourceDir || process.env.SOURCE_DIR;

    return this.create(providerType, apiKey, apiUrl, useCliMode, sourceDirectory);
  }

  /**
   * Get available provider types
   */
  static getAvailableTypes(): AIProviderType[] {
    return ['CURSOR', 'CLAUDE_CODE'];
  }
}
