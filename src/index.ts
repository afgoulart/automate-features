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

// Type exports
export * from './types';
