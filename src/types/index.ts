/**
 * Type definitions for @arranjae/automate-features
 */

/**
 * Configuration for the Pipeline
 */
export interface PipelineConfig {
  /** AI provider API token/key for code generation (legacy: cursorApiToken) */
  cursorApiToken?: string;
  /** AI provider type (CURSOR, CLAUDE_CODE) - defaults to PROMPT_AI_TYPE env var */
  aiProviderType?: 'CURSOR' | 'CLAUDE_CODE';
  /** AI provider API URL - defaults to PROMPT_API_URL env var or provider default */
  apiUrl?: string;
  /** Use CLI instead of HTTP API (default: false) */
  useCli?: boolean;
  /** Source directory for CLI context (only used with CLI mode) */
  sourceDir?: string;
  /** GitHub API token (optional) */
  githubToken?: string;
  /** Repository owner (required if using GitHub features) */
  repoOwner?: string;
  /** Repository name (required if using GitHub features) */
  repoName?: string;
  /** Configuration options */
  config?: {
    /** Enable SOLID principles validation */
    solidRules?: boolean;
    /** Enable Atomic Design validation */
    atomicDesign?: boolean;
    /** Lint rules to apply */
    lintRules?: string[];
    /** Auto-approve PRs that pass all checks */
    autoApprove?: boolean;
  };
}

/**
 * Internal configuration with required fields
 */
export interface PipelineConfigInternal {
  cursorApiToken: string;
  aiProviderType?: 'CURSOR' | 'CLAUDE_CODE';
  apiUrl?: string;
  githubToken: string;
  repoOwner: string;
  repoName: string;
  config: {
    solidRules: boolean;
    atomicDesign: boolean;
    lintRules: string[];
    autoApprove: boolean;
  };
}

/**
 * Options for processing a prompt
 */
export interface ProcessOptions {
  /** The prompt/description in natural language */
  prompt: string;
  /** Create a new branch */
  createBranch?: boolean;
  /** Create a GitHub issue */
  createIssue?: boolean;
  /** Create a Pull Request */
  createPR?: boolean;
  /** Run code review after generation */
  runCodeReview?: boolean;
  /** Branch name (auto-generated if not provided) */
  branchName?: string;
}

/**
 * Result of processing a prompt
 */
export interface ProcessResult {
  /** Success status */
  success: boolean;
  /** Generated code */
  code?: string;
  /** Branch name created */
  branchName?: string;
  /** Issue number created */
  issueNumber?: number;
  /** PR number created */
  prNumber?: number;
  /** Review results if review was run */
  review?: ReviewResult;
  /** Error message if failed */
  error?: string;
}

/**
 * Options for code review
 */
export interface ReviewOptions {
  /** PR number to review */
  prNumber?: number;
  /** Code content to review (if not PR) */
  code?: string;
  /** File path (if reviewing single file) */
  filePath?: string;
}

/**
 * Result of code review
 */
export interface ReviewResult {
  /** Overall pass status */
  passed: boolean;
  /** SOLID validation results */
  solid?: ValidationResult;
  /** Atomic Design validation results */
  atomicDesign?: ValidationResult;
  /** Lint validation results */
  lint?: ValidationResult;
  /** Summary of issues */
  summary?: string;
  /** Detailed issues found */
  issues?: Issue[];
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Pass status */
  passed: boolean;
  /** Number of issues found */
  issueCount: number;
  /** Issues found */
  issues: Issue[];
}

/**
 * Issue found during validation
 */
export interface Issue {
  /** Issue type */
  type: 'error' | 'warning' | 'info';
  /** Issue message */
  message: string;
  /** File path (if applicable) */
  file?: string;
  /** Line number (if applicable) */
  line?: number;
  /** Column number (if applicable) */
  column?: number;
  /** Suggestion to fix */
  suggestion?: string;
}

/**
 * Generated code result
 */
export interface GeneratedCode {
  /** The generated code */
  code: string;
  /** File path suggestion */
  filePath?: string;
  /** Language/type */
  language?: string;
}

/**
 * Generator configuration
 */
export interface GeneratorConfig {
  /** Language to generate */
  language?: string;
  /** Framework/library to use */
  framework?: string;
  /** Additional context */
  context?: string;
}
