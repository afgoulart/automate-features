/**
 * Code Parser - Extracts multiple files from generated code
 * Supports both CLI and API generated code formats
 */

export interface ParsedFile {
  path: string;
  content: string;
  language?: string;
}

export interface ParseResult {
  files: ParsedFile[];
  rawContent: string;
}

export class CodeParser {
  /**
   * Parse generated code and extract files
   * Supports multiple formats:
   * 1. Markdown with file paths: ```typescript:path/to/file.ts
   * 2. XML-like tags: <file path="...">...</file>
   * 3. Comments with paths: // File: path/to/file.ts
   * 4. Single code block (fallback)
   */
  static parse(generatedCode: string): ParseResult {
    // Try format 1: Markdown with file paths (```language:path)
    const markdownFiles = this.parseMarkdownWithPaths(generatedCode);
    if (markdownFiles.length > 0) {
      return { files: markdownFiles, rawContent: generatedCode };
    }

    // Try format 2: XML-like tags
    const xmlFiles = this.parseXmlTags(generatedCode);
    if (xmlFiles.length > 0) {
      return { files: xmlFiles, rawContent: generatedCode };
    }

    // Try format 3: Comment-based paths
    const commentFiles = this.parseCommentPaths(generatedCode);
    if (commentFiles.length > 0) {
      return { files: commentFiles, rawContent: generatedCode };
    }

    // Try format 4: Header-based format (## File: path)
    const headerFiles = this.parseHeaderPaths(generatedCode);
    if (headerFiles.length > 0) {
      return { files: headerFiles, rawContent: generatedCode };
    }

    // Fallback: Single code block
    const singleFile = this.parseSingleCodeBlock(generatedCode);
    if (singleFile) {
      return { files: [singleFile], rawContent: generatedCode };
    }

    // No code found, return raw content as a single file
    return {
      files: [
        {
          path: 'generated-code.md',
          content: generatedCode,
        },
      ],
      rawContent: generatedCode,
    };
  }

  /**
   * Format 1: ```typescript:src/file.ts
   */
  private static parseMarkdownWithPaths(content: string): ParsedFile[] {
    const files: ParsedFile[] = [];
    const regex = /```(\w+):([^\n]+)\n([\s\S]*?)```/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
      const language = match[1];
      const path = match[2].trim();
      const code = match[3].trim();

      files.push({ path, content: code, language });
    }

    return files;
  }

  /**
   * Format 2: <file path="src/file.ts">...</file>
   */
  private static parseXmlTags(content: string): ParsedFile[] {
    const files: ParsedFile[] = [];
    const regex = /<file\s+path="([^"]+)"(?:\s+language="([^"]+)")?\s*>([\s\S]*?)<\/file>/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
      const path = match[1].trim();
      const language = match[2];
      const code = match[3].trim();

      // Remove code block markers if present
      const cleanCode = code.replace(/^```[\w]*\n|```$/g, '').trim();

      files.push({ path, content: cleanCode, language });
    }

    return files;
  }

  /**
   * Format 3: // File: src/file.ts or # File: src/file.ts
   */
  private static parseCommentPaths(content: string): ParsedFile[] {
    const files: ParsedFile[] = [];
    const sections = content.split(/(?:\/\/|#)\s*File:\s*([^\n]+)/);

    for (let i = 1; i < sections.length; i += 2) {
      const path = sections[i].trim();
      let code = sections[i + 1] || '';

      // Extract from code block if present
      const codeBlockMatch = code.match(/```[\w]*\n([\s\S]*?)```/);
      if (codeBlockMatch) {
        code = codeBlockMatch[1].trim();
      } else {
        // Take until next file marker or end
        const nextFileIndex = code.search(/(?:\/\/|#)\s*File:/);
        if (nextFileIndex > 0) {
          code = code.substring(0, nextFileIndex);
        }
        code = code.trim();
      }

      if (code) {
        const language = this.detectLanguage(path);
        files.push({ path, content: code, language });
      }
    }

    return files;
  }

  /**
   * Format 4: ## File: src/file.ts or ### src/file.ts
   */
  private static parseHeaderPaths(content: string): ParsedFile[] {
    const files: ParsedFile[] = [];
    const sections = content.split(/^#{2,3}\s*(?:File:\s*)?(.+)$/gm);

    for (let i = 1; i < sections.length; i += 2) {
      const path = sections[i].trim();
      let code = sections[i + 1] || '';

      // Skip if path looks like a title, not a file path
      if (!path.includes('/') && !path.includes('.')) {
        continue;
      }

      // Extract from code block if present
      const codeBlockMatch = code.match(/```[\w]*\n([\s\S]*?)```/);
      if (codeBlockMatch) {
        code = codeBlockMatch[1].trim();
      } else {
        // Take until next header or end
        const nextHeaderIndex = code.search(/^#{2,3}\s/m);
        if (nextHeaderIndex > 0) {
          code = code.substring(0, nextHeaderIndex);
        }
        code = code.trim();
      }

      if (code) {
        const language = this.detectLanguage(path);
        files.push({ path, content: code, language });
      }
    }

    return files;
  }

  /**
   * Fallback: Single code block
   */
  private static parseSingleCodeBlock(content: string): ParsedFile | null {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/;
    const match = content.match(codeBlockRegex);

    if (match && match[2]) {
      const language = match[1];
      const code = match[2].trim();

      // Try to infer filename from language
      const extension = this.getExtensionFromLanguage(language);
      const path = `generated-code${extension}`;

      return { path, content: code, language };
    }

    return null;
  }

  /**
   * Detect programming language from file extension
   */
  private static detectLanguage(path: string): string | undefined {
    const ext = path.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'tsx',
      js: 'javascript',
      jsx: 'jsx',
      py: 'python',
      rb: 'ruby',
      go: 'go',
      rs: 'rust',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      cs: 'csharp',
      php: 'php',
      swift: 'swift',
      kt: 'kotlin',
      scala: 'scala',
      sh: 'bash',
      yaml: 'yaml',
      yml: 'yaml',
      json: 'json',
      md: 'markdown',
      html: 'html',
      css: 'css',
      scss: 'scss',
      sql: 'sql',
    };

    return ext ? languageMap[ext] : undefined;
  }

  /**
   * Get file extension from language name
   */
  private static getExtensionFromLanguage(language?: string): string {
    const extensionMap: Record<string, string> = {
      typescript: '.ts',
      tsx: '.tsx',
      javascript: '.js',
      jsx: '.jsx',
      python: '.py',
      ruby: '.rb',
      go: '.go',
      rust: '.rs',
      java: '.java',
      cpp: '.cpp',
      c: '.c',
      csharp: '.cs',
      php: '.php',
      swift: '.swift',
      kotlin: '.kt',
      scala: '.scala',
      bash: '.sh',
      yaml: '.yaml',
      json: '.json',
      markdown: '.md',
      html: '.html',
      css: '.css',
      scss: '.scss',
      sql: '.sql',
    };

    return language ? extensionMap[language.toLowerCase()] || '.txt' : '.txt';
  }

  /**
   * Write parsed files to disk
   */
  static async writeFiles(files: ParsedFile[], baseDir: string = '.'): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');

    for (const file of files) {
      const fullPath = path.join(baseDir, file.path);
      const dir = path.dirname(fullPath);

      // Create directory if it doesn't exist
      await fs.mkdir(dir, { recursive: true });

      // Write file
      await fs.writeFile(fullPath, file.content, 'utf-8');
      console.log(`✅ Created: ${file.path}`);
    }
  }

  /**
   * Generate summary of parsed files
   */
  static getSummary(result: ParseResult): string {
    const { files } = result;

    if (files.length === 0) {
      return 'No files found in generated code.';
    }

    let summary = `Found ${files.length} file(s):\n\n`;

    for (const file of files) {
      const lines = file.content.split('\n').length;
      const bytes = Buffer.byteLength(file.content, 'utf-8');
      const lang = file.language || 'unknown';

      summary += `- ${file.path} (${lang}, ${lines} lines, ${bytes} bytes)\n`;
    }

    return summary;
  }
}
