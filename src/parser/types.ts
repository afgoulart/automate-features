/**
 * Types for template-based code generation and parsing
 */

/**
 * Supported file operations
 */
export enum FileOperation {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  RENAME = 'RENAME',
}

/**
 * File action from AI response
 */
export interface FileAction {
  operation: FileOperation;
  path: string;
  content?: string;
  oldPath?: string; // For RENAME operation
  description?: string;
}

/**
 * Parsed response from AI
 */
export interface ParsedResponse {
  summary: string;
  files: FileAction[];
  commands?: string[];
  warnings?: string[];
  metadata?: {
    estimatedTime?: string;
    complexity?: 'simple' | 'medium' | 'complex';
    dependencies?: string[];
  };
}

/**
 * Template for prompting AI
 */
export interface PromptTemplate {
  systemPrompt: string;
  responseFormat: string;
  examples?: string[];
}

/**
 * Execution result
 */
export interface ExecutionResult {
  success: boolean;
  filesCreated: string[];
  filesUpdated: string[];
  filesDeleted: string[];
  commandsExecuted: string[];
  errors: Array<{
    file?: string;
    operation?: string;
    error: string;
  }>;
}
