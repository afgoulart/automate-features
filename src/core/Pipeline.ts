import { PipelineConfig, ProcessOptions, ProcessResult, ReviewResult } from '../types';
import { CodeGenerator } from './CodeGenerator';
import { CodeReviewer } from './CodeReviewer';
import { BranchGenerator } from '../generators/BranchGenerator';
import { TaskCreator } from '../generators/TaskCreator';
import { PRGenerator } from '../generators/PRGenerator';

/**
 * Main Pipeline class for orchestrating the development automation workflow
 */
export class Pipeline {
  private config: Required<PipelineConfig>;
  private codeGenerator: CodeGenerator;
  private codeReviewer: CodeReviewer;
  private branchGenerator?: BranchGenerator;
  private taskCreator?: TaskCreator;
  private prGenerator?: PRGenerator;

  constructor(config: PipelineConfig) {
    // Validate required config
    if (!config.cursorApiToken) {
      throw new Error('Cursor API token is required');
    }

    this.config = {
      cursorApiToken: config.cursorApiToken,
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
    this.codeGenerator = new CodeGenerator(this.config.cursorApiToken);
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
