/**
 * @arranjae/automate-features
 *
 * Módulo de automação de desenvolvimento com geração de código,
 * code review e integração com pipelines
 */

// Core exports
export { Pipeline } from './core/Pipeline';
export { CodeGenerator } from './core/CodeGenerator';
export { CodeReviewer } from './core/CodeReviewer';
export { CodeParser } from './core/CodeParser';
export type { ParsedFile, ParseResult } from './core/CodeParser';

// Generator exports
export { BranchGenerator } from './generators/BranchGenerator';
export { TaskCreator } from './generators/TaskCreator';
export { PRGenerator } from './generators/PRGenerator';

// Validator exports
export { SolidValidator } from './validators/SolidValidator';
export { AtomicDesignValidator } from './validators/AtomicDesignValidator';
export { LintValidator } from './validators/LintValidator';

// Integration exports
export { CursorAPI } from './integrations/CursorAPI';
export { GitHubAPI } from './integrations/GitHubAPI';
export { GitAPI } from './integrations/GitAPI';

// AI Provider exports
export { AIProvider, AIProviderType } from './integrations/AIProvider';
export { AIProviderFactory } from './integrations/AIProviderFactory';
export { CursorProvider } from './integrations/providers/CursorProvider';
export { ClaudeCodeProvider } from './integrations/providers/ClaudeCodeProvider';
export { CursorCliProvider } from './integrations/providers/CursorCliProvider';
export { ClaudeCodeCliProvider } from './integrations/providers/ClaudeCodeCliProvider';

// Type exports
export * from './types';
