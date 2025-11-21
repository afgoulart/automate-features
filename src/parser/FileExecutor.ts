import * as fs from 'fs/promises';
import * as path from 'path';
import { FileAction, FileOperation, ExecutionResult } from './types';

/**
 * Executes file operations from parsed AI responses
 */
export class FileExecutor {
  private baseDir: string;

  constructor(baseDir: string = process.cwd()) {
    this.baseDir = baseDir;
  }

  /**
   * Execute all file operations from parsed response
   */
  async executeAll(files: FileAction[]): Promise<ExecutionResult> {
    const result: ExecutionResult = {
      success: true,
      filesCreated: [],
      filesUpdated: [],
      filesDeleted: [],
      commandsExecuted: [],
      errors: [],
    };

    console.log(`[FileExecutor] Executing ${files.length} file operations...`);

    for (const file of files) {
      try {
        await this.executeFileOperation(file, result);
      } catch (error: any) {
        console.error(`[FileExecutor] Error processing ${file.path}:`, error.message);
        result.success = false;
        result.errors.push({
          file: file.path,
          operation: file.operation,
          error: error.message,
        });
      }
    }

    return result;
  }

  /**
   * Execute a single file operation
   */
  private async executeFileOperation(file: FileAction, result: ExecutionResult): Promise<void> {
    const fullPath = path.resolve(this.baseDir, file.path);

    // Security check: ensure path is within baseDir
    if (!fullPath.startsWith(this.baseDir)) {
      throw new Error(`Security violation: path ${file.path} is outside base directory`);
    }

    console.log(`[FileExecutor] ${file.operation}: ${file.path}`);

    switch (file.operation) {
      case FileOperation.CREATE:
        await this.createFile(fullPath, file.content!, result);
        break;

      case FileOperation.UPDATE:
        await this.updateFile(fullPath, file.content!, result);
        break;

      case FileOperation.DELETE:
        await this.deleteFile(fullPath, result);
        break;

      case FileOperation.RENAME:
        await this.renameFile(fullPath, file.oldPath!, result);
        break;

      default:
        throw new Error(`Unknown operation: ${file.operation}`);
    }
  }

  /**
   * Create a new file
   */
  private async createFile(filePath: string, content: string, result: ExecutionResult): Promise<void> {
    // Check if file already exists
    const exists = await this.fileExists(filePath);
    if (exists) {
      throw new Error(`File already exists: ${filePath}`);
    }

    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(filePath, content, 'utf-8');
    result.filesCreated.push(filePath);

    console.log(`[FileExecutor] ✓ Created: ${filePath}`);
  }

  /**
   * Update an existing file
   */
  private async updateFile(filePath: string, content: string, result: ExecutionResult): Promise<void> {
    // Check if file exists
    const exists = await this.fileExists(filePath);
    if (!exists) {
      throw new Error(`File does not exist: ${filePath}`);
    }

    // Create backup
    await this.createBackup(filePath);

    // Write updated content
    await fs.writeFile(filePath, content, 'utf-8');
    result.filesUpdated.push(filePath);

    console.log(`[FileExecutor] ✓ Updated: ${filePath}`);
  }

  /**
   * Delete a file
   */
  private async deleteFile(filePath: string, result: ExecutionResult): Promise<void> {
    // Check if file exists
    const exists = await this.fileExists(filePath);
    if (!exists) {
      throw new Error(`File does not exist: ${filePath}`);
    }

    // Create backup before deleting
    await this.createBackup(filePath);

    // Delete file
    await fs.unlink(filePath);
    result.filesDeleted.push(filePath);

    console.log(`[FileExecutor] ✓ Deleted: ${filePath}`);
  }

  /**
   * Rename/move a file
   */
  private async renameFile(newPath: string, oldPath: string, result: ExecutionResult): Promise<void> {
    const fullOldPath = path.resolve(this.baseDir, oldPath);

    // Security check for oldPath
    if (!fullOldPath.startsWith(this.baseDir)) {
      throw new Error(`Security violation: oldPath ${oldPath} is outside base directory`);
    }

    // Check if old file exists
    const exists = await this.fileExists(fullOldPath);
    if (!exists) {
      throw new Error(`File does not exist: ${oldPath}`);
    }

    // Check if new path already exists
    const newExists = await this.fileExists(newPath);
    if (newExists) {
      throw new Error(`Target file already exists: ${newPath}`);
    }

    // Ensure target directory exists
    const dir = path.dirname(newPath);
    await fs.mkdir(dir, { recursive: true });

    // Rename file
    await fs.rename(fullOldPath, newPath);
    result.filesUpdated.push(newPath);

    console.log(`[FileExecutor] ✓ Renamed: ${oldPath} → ${newPath}`);
  }

  /**
   * Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create backup of file
   */
  private async createBackup(filePath: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${filePath}.backup-${timestamp}`;

    try {
      await fs.copyFile(filePath, backupPath);
      console.log(`[FileExecutor] Backup created: ${backupPath}`);
    } catch (error: any) {
      console.warn(`[FileExecutor] Failed to create backup: ${error.message}`);
      // Don't throw - backup is nice to have but not critical
    }
  }

  /**
   * Dry run - validate operations without executing
   */
  async dryRun(files: FileAction[]): Promise<ExecutionResult> {
    const result: ExecutionResult = {
      success: true,
      filesCreated: [],
      filesUpdated: [],
      filesDeleted: [],
      commandsExecuted: [],
      errors: [],
    };

    console.log(`[FileExecutor] Dry run: validating ${files.length} operations...`);

    for (const file of files) {
      const fullPath = path.resolve(this.baseDir, file.path);

      // Security check
      if (!fullPath.startsWith(this.baseDir)) {
        result.errors.push({
          file: file.path,
          operation: file.operation,
          error: 'Path is outside base directory',
        });
        continue;
      }

      const exists = await this.fileExists(fullPath);

      switch (file.operation) {
        case FileOperation.CREATE:
          if (exists) {
            result.errors.push({
              file: file.path,
              operation: file.operation,
              error: 'File already exists',
            });
          } else {
            result.filesCreated.push(file.path);
          }
          break;

        case FileOperation.UPDATE:
          if (!exists) {
            result.errors.push({
              file: file.path,
              operation: file.operation,
              error: 'File does not exist',
            });
          } else {
            result.filesUpdated.push(file.path);
          }
          break;

        case FileOperation.DELETE:
          if (!exists) {
            result.errors.push({
              file: file.path,
              operation: file.operation,
              error: 'File does not exist',
            });
          } else {
            result.filesDeleted.push(file.path);
          }
          break;

        case FileOperation.RENAME:
          const fullOldPath = path.resolve(this.baseDir, file.oldPath!);
          const oldExists = await this.fileExists(fullOldPath);

          if (!oldExists) {
            result.errors.push({
              file: file.path,
              operation: file.operation,
              error: `Old file does not exist: ${file.oldPath}`,
            });
          } else if (exists) {
            result.errors.push({
              file: file.path,
              operation: file.operation,
              error: 'Target file already exists',
            });
          } else {
            result.filesUpdated.push(file.path);
          }
          break;
      }
    }

    result.success = result.errors.length === 0;

    console.log('[FileExecutor] Dry run complete:');
    console.log(`  - Files to create: ${result.filesCreated.length}`);
    console.log(`  - Files to update: ${result.filesUpdated.length}`);
    console.log(`  - Files to delete: ${result.filesDeleted.length}`);
    console.log(`  - Errors: ${result.errors.length}`);

    return result;
  }
}
