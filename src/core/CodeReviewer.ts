import { ReviewResult } from '../types';
import { SolidValidator } from '../validators/SolidValidator';
import { AtomicDesignValidator } from '../validators/AtomicDesignValidator';
import { LintValidator } from '../validators/LintValidator';

interface ReviewerConfig {
  solidRules?: boolean;
  atomicDesign?: boolean;
  lintRules?: string[];
}

/**
 * Code reviewer that applies SOLID, Atomic Design, and Lint validations
 */
export class CodeReviewer {
  private config: ReviewerConfig;
  private solidValidator: SolidValidator;
  private atomicDesignValidator: AtomicDesignValidator;
  private lintValidator: LintValidator;

  constructor(config: ReviewerConfig) {
    this.config = config;
    this.solidValidator = new SolidValidator();
    this.atomicDesignValidator = new AtomicDesignValidator();
    this.lintValidator = new LintValidator(config.lintRules || ['eslint']);
  }

  /**
   * Review code content
   */
  async review(code: string, filePath?: string): Promise<ReviewResult> {
    const results: ReviewResult = {
      passed: true,
      issues: [],
    };

    // SOLID validation
    if (this.config.solidRules) {
      results.solid = await this.solidValidator.validate(code, filePath);
      if (!results.solid.passed) {
        results.passed = false;
        results.issues?.push(...results.solid.issues);
      }
    }

    // Atomic Design validation
    if (this.config.atomicDesign && filePath) {
      results.atomicDesign = await this.atomicDesignValidator.validate(code, filePath);
      if (!results.atomicDesign.passed) {
        results.passed = false;
        results.issues?.push(...results.atomicDesign.issues);
      }
    }

    // Lint validation
    if (this.config.lintRules && this.config.lintRules.length > 0) {
      results.lint = await this.lintValidator.validate(code, filePath);
      if (!results.lint.passed) {
        results.passed = false;
        results.issues?.push(...results.lint.issues);
      }
    }

    // Generate summary
    results.summary = this.generateSummary(results);

    return results;
  }

  /**
   * Review a Pull Request
   */
  async reviewPR(
    _prNumber: number,
    _githubToken: string,
    _repo: { owner: string; repo: string }
  ): Promise<ReviewResult> {
    // This will be implemented to fetch PR files and review them
    // For now, return a placeholder
    throw new Error('PR review not yet implemented');
  }

  /**
   * Generate a summary of review results
   */
  private generateSummary(results: ReviewResult): string {
    const parts: string[] = [];

    if (results.solid) {
      parts.push(`SOLID: ${results.solid.issueCount} issue(s)`);
    }
    if (results.atomicDesign) {
      parts.push(`Atomic Design: ${results.atomicDesign.issueCount} issue(s)`);
    }
    if (results.lint) {
      parts.push(`Lint: ${results.lint.issueCount} issue(s)`);
    }

    const status = results.passed ? '✅ Passed' : '❌ Failed';
    return `${status} - ${parts.join(', ')}`;
  }
}
