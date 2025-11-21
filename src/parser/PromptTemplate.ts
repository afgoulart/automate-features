import { PromptTemplate } from './types';

/**
 * Builds structured prompts for AI code generation
 */
export class PromptTemplateBuilder {
  /**
   * Get the standard template for code generation with structured output
   */
  static getCodeGenerationTemplate(): PromptTemplate {
    return {
      systemPrompt: `You are an expert software engineer. Generate code following these rules:

1. ALWAYS respond in the following XML-based format
2. Be precise and follow best practices
3. Include error handling and type safety
4. Add comments for complex logic

Your response MUST follow this exact structure:`,

      responseFormat: `
<response>
  <summary>
    Brief description of what will be implemented (1-2 sentences)
  </summary>

  <metadata>
    <estimatedTime>time estimate</estimatedTime>
    <complexity>simple|medium|complex</complexity>
    <dependencies>
      <dependency>package-name@version</dependency>
      <!-- Add more dependencies if needed -->
    </dependencies>
  </metadata>

  <files>
    <file>
      <operation>CREATE|UPDATE|DELETE|RENAME</operation>
      <path>relative/path/to/file.ts</path>
      <oldPath>old/path (only for RENAME)</oldPath>
      <description>What this file does</description>
      <content><![CDATA[
// Full file content here
// Use CDATA to avoid XML parsing issues
]]></content>
    </file>
    <!-- Add more files as needed -->
  </files>

  <commands>
    <command>npm install package-name</command>
    <!-- Add more commands if needed -->
  </commands>

  <warnings>
    <warning>Important warning or consideration</warning>
    <!-- Add warnings if applicable -->
  </warnings>
</response>
`,

      examples: [
        `
Example request: "Create a simple user authentication service"

Example response:
<response>
  <summary>
    Creating a UserAuthService with login/logout functionality using JWT tokens
  </summary>

  <metadata>
    <estimatedTime>15 minutes</estimatedTime>
    <complexity>medium</complexity>
    <dependencies>
      <dependency>jsonwebtoken@9.0.0</dependency>
      <dependency>bcrypt@5.1.0</dependency>
    </dependencies>
  </metadata>

  <files>
    <file>
      <operation>CREATE</operation>
      <path>src/services/AuthService.ts</path>
      <description>User authentication service with JWT</description>
      <content><![CDATA[
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export class AuthService {
  private secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(userId: string): string {
    return jwt.sign({ userId }, this.secretKey, { expiresIn: '24h' });
  }

  verifyToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, this.secretKey) as { userId: string };
    } catch (error) {
      return null;
    }
  }
}
]]></content>
    </file>
  </files>

  <commands>
    <command>npm install jsonwebtoken @types/jsonwebtoken</command>
    <command>npm install bcrypt @types/bcrypt</command>
  </commands>

  <warnings>
    <warning>Store secretKey in environment variables, never hardcode it</warning>
    <warning>Consider using refresh tokens for better security</warning>
  </warnings>
</response>
`,
      ],
    };
  }

  /**
   * Build a complete prompt with template
   */
  static buildPrompt(userRequest: string, context?: string): string {
    const template = this.getCodeGenerationTemplate();

    let prompt = `${template.systemPrompt}\n\n${template.responseFormat}\n\n`;

    if (template.examples && template.examples.length > 0) {
      prompt += `\n## Examples:\n${template.examples.join('\n\n')}\n\n`;
    }

    if (context) {
      prompt += `\n## Context:\n${context}\n\n`;
    }

    prompt += `\n## User Request:\n${userRequest}\n\n`;
    prompt += `Remember: Respond ONLY with the XML structure shown above. Do not add any text before or after the XML.`;

    return prompt;
  }

  /**
   * Build prompt for code review
   */
  static buildReviewPrompt(code: string, filePath?: string): string {
    return `Review the following code and provide feedback in the same XML format.

File: ${filePath || 'unknown'}

Code:
\`\`\`
${code}
\`\`\`

Provide a response with:
- Summary of code quality
- Suggestions for improvements (as file UPDATE operations)
- Warnings about potential issues

Use the same XML structure as before.`;
  }

  /**
   * Build prompt for refactoring
   */
  static buildRefactorPrompt(
    code: string,
    refactorType: 'extract' | 'rename' | 'optimize' | 'modernize',
    details: string
  ): string {
    return `Refactor the following code (${refactorType}):

Details: ${details}

Code:
\`\`\`
${code}
\`\`\`

Provide the refactored version using the XML format.
Include both the original file (UPDATE) and any new files (CREATE) if needed.`;
  }
}
