import { parseStringPromise } from 'xml2js';
import { ParsedResponse, FileAction, FileOperation } from './types';

/**
 * Parser for structured AI responses in XML format
 */
export class ResponseParser {
  /**
   * Parse XML response from AI into structured format
   */
  static async parseXMLResponse(xmlResponse: string): Promise<ParsedResponse> {
    try {
      // Clean the response - remove any text before/after XML
      const cleanedXml = this.extractXML(xmlResponse);

      // Parse XML to JavaScript object
      const parsed = await parseStringPromise(cleanedXml, {
        explicitArray: false,
        trim: true,
        normalize: true,
        normalizeTags: true,
        ignoreAttrs: true,
      });

      if (!parsed.response) {
        throw new Error('Invalid response format: missing <response> root element');
      }

      const response = parsed.response;

      // Extract summary
      const summary = this.extractText(response.summary);
      if (!summary) {
        throw new Error('Invalid response format: missing <summary>');
      }

      // Extract metadata (optional)
      const metadata = response.metadata
        ? {
            estimatedTime: this.extractText(response.metadata.estimatedtime),
            complexity: this.extractText(response.metadata.complexity) as
              | 'simple'
              | 'medium'
              | 'complex'
              | undefined,
            dependencies: this.extractArray(response.metadata.dependencies?.dependency),
          }
        : undefined;

      // Extract files
      const files = this.extractFiles(response.files);

      // Extract commands (optional)
      const commands = this.extractArray(response.commands?.command);

      // Extract warnings (optional)
      const warnings = this.extractArray(response.warnings?.warning);

      return {
        summary,
        files,
        commands,
        warnings,
        metadata,
      };
    } catch (error: any) {
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }

  /**
   * Extract XML content from response (handles text before/after XML)
   */
  private static extractXML(response: string): string {
    const xmlMatch = response.match(/<response>[\s\S]*<\/response>/);
    if (!xmlMatch) {
      throw new Error('No valid XML response found in output');
    }
    return xmlMatch[0];
  }

  /**
   * Extract text content, handling CDATA sections
   */
  private static extractText(value: any): string | undefined {
    if (!value) return undefined;

    if (typeof value === 'string') {
      return value.trim();
    }

    // Handle objects with text content
    if (value._) {
      return value._.trim();
    }

    return undefined;
  }

  /**
   * Extract array from XML (handles single item or array)
   */
  private static extractArray(value: any): string[] | undefined {
    if (!value) return undefined;

    if (Array.isArray(value)) {
      return value.map((v) => this.extractText(v)).filter((v): v is string => v !== undefined);
    }

    const text = this.extractText(value);
    return text ? [text] : undefined;
  }

  /**
   * Extract file actions from XML
   */
  private static extractFiles(filesNode: any): FileAction[] {
    if (!filesNode || !filesNode.file) {
      return [];
    }

    const fileNodes = Array.isArray(filesNode.file) ? filesNode.file : [filesNode.file];

    return fileNodes.map((fileNode: any) => {
      const operation = this.extractText(fileNode.operation)?.toUpperCase() as FileOperation;
      const path = this.extractText(fileNode.path);
      const content = this.extractText(fileNode.content);
      const oldPath = this.extractText(fileNode.oldpath);
      const description = this.extractText(fileNode.description);

      // Validate required fields
      if (!operation) {
        throw new Error('File operation is required');
      }

      if (!Object.values(FileOperation).includes(operation)) {
        throw new Error(`Invalid file operation: ${operation}`);
      }

      if (!path) {
        throw new Error('File path is required');
      }

      // Validate operation-specific requirements
      if (operation === FileOperation.CREATE || operation === FileOperation.UPDATE) {
        if (!content) {
          throw new Error(`Content is required for ${operation} operation`);
        }
      }

      if (operation === FileOperation.RENAME && !oldPath) {
        throw new Error('oldPath is required for RENAME operation');
      }

      return {
        operation,
        path,
        content,
        oldPath,
        description,
      };
    });
  }

  /**
   * Validate parsed response
   */
  static validateResponse(response: ParsedResponse): void {
    if (!response.summary || response.summary.trim().length === 0) {
      throw new Error('Summary cannot be empty');
    }

    if (!response.files || response.files.length === 0) {
      throw new Error('At least one file operation is required');
    }

    // Validate each file action
    for (const file of response.files) {
      if (!file.path || file.path.trim().length === 0) {
        throw new Error('File path cannot be empty');
      }

      // Check for path traversal attempts
      if (file.path.includes('..') || file.path.startsWith('/')) {
        throw new Error(`Invalid file path: ${file.path}. Paths must be relative and not contain '..'`);
      }

      // Validate operation-specific requirements
      switch (file.operation) {
        case FileOperation.CREATE:
        case FileOperation.UPDATE:
          if (!file.content || file.content.trim().length === 0) {
            throw new Error(`Content is required for ${file.operation} operation on ${file.path}`);
          }
          break;

        case FileOperation.RENAME:
          if (!file.oldPath || file.oldPath.trim().length === 0) {
            throw new Error(`oldPath is required for RENAME operation on ${file.path}`);
          }
          if (file.oldPath.includes('..') || file.oldPath.startsWith('/')) {
            throw new Error(`Invalid oldPath: ${file.oldPath}. Paths must be relative and not contain '..'`);
          }
          break;

        case FileOperation.DELETE:
          // No additional validation needed
          break;
      }
    }

    // Validate metadata if present
    if (response.metadata?.complexity) {
      const validComplexities = ['simple', 'medium', 'complex'];
      if (!validComplexities.includes(response.metadata.complexity)) {
        throw new Error(`Invalid complexity: ${response.metadata.complexity}`);
      }
    }
  }
}
