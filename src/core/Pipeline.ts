import {
  PipelineConfig,
  PipelineConfigInternal,
  ProcessOptions,
  ProcessResult,
  ReviewResult,
} from '../types';
import { CodeGenerator } from './CodeGenerator';
import { CodeReviewer } from './CodeReviewer';
import { BranchGenerator } from '../generators/BranchGenerator';
import { TaskCreator } from '../generators/TaskCreator';
import { PRGenerator } from '../generators/PRGenerator';

/**
 * Main Pipeline class for orchestrating the development automation workflow
 */
export class Pipeline {
  private config: PipelineConfigInternal;
  private codeGenerator: CodeGenerator;
  private codeReviewer: CodeReviewer;
  private branchGenerator?: BranchGenerator;
  private taskCreator?: TaskCreator;
  private prGenerator?: PRGenerator;

  constructor(config: PipelineConfig) {
    // PROMPT_AI_KEY é a variável única que funciona para qualquer tipo de AI (CURSOR ou CLAUDE_CODE)
    // Para Claude Code, também aceita ANTHROPIC_API_KEY (padrão da Anthropic)
    let aiProviderTypeStr = config.aiProviderType || process.env.PROMPT_AI_TYPE || 'CURSOR';
    
    // Normalize common typos
    aiProviderTypeStr = aiProviderTypeStr.toUpperCase()
      .replace('CLOUD_CODE', 'CLAUDE_CODE')
      .replace('CLOUD', 'CLAUDE')
      .replace('COURSOR', 'CURSOR');
    
    const aiProviderType = (aiProviderTypeStr === 'CLAUDE_CODE' ? 'CLAUDE_CODE' : 'CURSOR') as 'CURSOR' | 'CLAUDE_CODE';
    
    console.log(`[Pipeline] aiProviderType normalizado: "${aiProviderType}"`);
    
    let aiToken =
      config.cursorApiToken || process.env.PROMPT_AI_KEY || process.env.CURSOR_API_TOKEN;
    
    // Se for CLAUDE_CODE e não tiver PROMPT_AI_KEY, tenta ANTHROPIC_API_KEY
    if (!aiToken && aiProviderType === 'CLAUDE_CODE') {
      aiToken = process.env.ANTHROPIC_API_KEY || '';
    }
    
    // apiUrl pode ser passado como parâmetro ou vir de variável de ambiente
    const apiUrl = config.apiUrl || process.env.PROMPT_API_URL;

    if (!aiToken) {
      const errorMsg = aiProviderType === 'CLAUDE_CODE'
        ? 'AI provider token/key is required. Provide cursorApiToken in config or set PROMPT_AI_KEY or ANTHROPIC_API_KEY environment variable.'
        : 'AI provider token/key is required. Provide cursorApiToken in config or set PROMPT_AI_KEY environment variable. ' +
          'PROMPT_AI_KEY funciona para qualquer tipo de AI (defina PROMPT_AI_TYPE como CURSOR ou CLAUDE_CODE).';
      throw new Error(errorMsg);
    }

    // useCli: prioriza o valor do config, depois a env var
    // Se config.useCli for explicitamente false, não usa env var
    const useCli = config.useCli !== undefined 
      ? config.useCli 
      : (process.env.USE_CLI === 'true' || process.env.USE_CLI === '1');
    const sourceDir = config.sourceDir || process.env.SOURCE_DIR;

    // Debug: Log CLI mode status
    console.log(`[Pipeline] 🔍 DEBUG useCli:`);
    console.log(`   - config.useCli: ${config.useCli}`);
    console.log(`   - process.env.USE_CLI: "${process.env.USE_CLI}"`);
    console.log(`   - useCli final: ${useCli}`);
    
    if (useCli) {
      console.log('[Pipeline] 🔧 CLI mode ENABLED');
      console.log(`[Pipeline] sourceDir: ${sourceDir}`);
    } else {
      console.log('[Pipeline] 🌐 HTTP API mode (CLI disabled)');
    }

    this.config = {
      cursorApiToken: aiToken, // Keep for backward compatibility
      aiProviderType: aiProviderType, // Usa o tipo normalizado, não o original do config
      apiUrl,
      githubToken: config.githubToken || '',
      repoOwner: config.repoOwner || '',
      repoName: config.repoName || '',
      config: {
        solidRules: config.config?.solidRules ?? true,
        atomicDesign: config.config?.atomicDesign ?? true,
        lintRules: config.config?.lintRules ?? ['eslint'],
        autoApprove: config.config?.autoApprove ?? false,
      },
    };

    // Initialize components
    // CodeGenerator now supports multiple AI providers via environment variables
    // and CLI mode with source directory context
    console.log(`[Pipeline] Creating CodeGenerator with useCli=${useCli}, sourceDir=${sourceDir}, aiProviderType=${this.config.aiProviderType}`);
    this.codeGenerator = new CodeGenerator(aiToken, apiUrl, useCli, sourceDir, this.config.aiProviderType);
    this.codeReviewer = new CodeReviewer(this.config.config);

    if (this.config.githubToken) {
      this.branchGenerator = new BranchGenerator(this.config.githubToken);
      this.taskCreator = new TaskCreator(this.config.githubToken);
      this.prGenerator = new PRGenerator(this.config.githubToken);
    }
  }

  /**
   * Process a prompt and execute the full workflow
   */
  async process(options: ProcessOptions): Promise<ProcessResult> {
    try {
      const result: ProcessResult = {
        success: false,
      };

      // Generate code
      const generatedCode = await this.codeGenerator.generate(options.prompt);

      if (!generatedCode.code) {
        return {
          ...result,
          error: 'Failed to generate code',
        };
      }

      result.code = generatedCode.code;

      // Create branch if requested
      if (
        options.createBranch &&
        this.branchGenerator &&
        this.config.repoOwner &&
        this.config.repoName
      ) {
        const branchName = options.branchName || this.generateBranchName(options.prompt);
        await this.branchGenerator.create(branchName, {
          owner: this.config.repoOwner,
          repo: this.config.repoName,
        });
        result.branchName = branchName;
      }

      // Create issue if requested
      if (
        options.createIssue &&
        this.taskCreator &&
        this.config.repoOwner &&
        this.config.repoName
      ) {
        const issue = await this.taskCreator.create(
          {
            title: this.extractTitle(options.prompt),
            description: options.prompt,
          },
          {
            owner: this.config.repoOwner,
            repo: this.config.repoName,
          }
        );
        result.issueNumber = issue.number;
      }

      // Create PR if requested
      if (options.createPR && this.prGenerator && this.config.repoOwner && this.config.repoName) {
        const pr = await this.prGenerator.create(
          {
            title: this.extractTitle(options.prompt),
            body: this.generatePRDescription(options.prompt, generatedCode.code),
            branch: result.branchName || 'main',
          },
          {
            owner: this.config.repoOwner,
            repo: this.config.repoName,
          }
        );
        result.prNumber = pr.number;

        // Run code review if requested
        if (options.runCodeReview) {
          result.review = await this.review(pr.number);
        }
      } else if (options.runCodeReview) {
        // Review generated code directly
        result.review = await this.codeReviewer.review(generatedCode.code);
      }

      result.success = true;
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Review a Pull Request
   */
  async review(prNumber: number): Promise<ReviewResult> {
    if (!this.config.githubToken) {
      throw new Error('GitHub token is required for PR review');
    }

    return this.codeReviewer.reviewPR(prNumber, this.config.githubToken, {
      owner: this.config.repoOwner!,
      repo: this.config.repoName!,
    });
  }

  /**
   * Generate a branch name from a prompt
   */
  private generateBranchName(prompt: string): string {
    // Simple implementation - can be enhanced
    const sanitized = prompt
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50);
    return `feature/${sanitized}`;
  }

  /**
   * Extract a title from a prompt
   */
  private extractTitle(prompt: string): string {
    // Take first sentence or first 50 characters
    const firstLine = prompt.split('\n')[0]?.split('.')[0];
    return (firstLine || prompt).slice(0, 50);
  }

  /**
   * Generate PR description
   */
  private generatePRDescription(prompt: string, code: string): string {
    return `## Description\n\n${prompt}\n\n## Generated Code\n\n\`\`\`\n${code.slice(0, 500)}...\n\`\`\`\n\n---\n\n*Auto-generated by @arranjae/automate-features*`;
  }
}
