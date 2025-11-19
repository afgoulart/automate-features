import { AIProvider } from '../AIProvider';
import axios from 'axios';

/**
 * Google Gemini API Provider
 * Implements integration with Google's Gemini AI API
 */
export class GeminiProvider implements AIProvider {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-pro') {
    this.apiKey = apiKey;
    this.model = model;
    // Google Gemini API endpoint
    this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
  }

  /**
   * Generate code using Gemini API
   */
  async generateCode(prompt: string): Promise<string> {
    console.log(`[GeminiProvider] Generating code with model: ${this.model}`);
    console.log(`[GeminiProvider] API URL: ${this.apiUrl}`);

    try {
      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 120000, // 2 minutes timeout
        }
      );

      console.log('[GeminiProvider] Response received');

      // Extract generated text from Gemini response
      if (
        response.data &&
        response.data.candidates &&
        response.data.candidates[0] &&
        response.data.candidates[0].content &&
        response.data.candidates[0].content.parts &&
        response.data.candidates[0].content.parts[0]
      ) {
        const generatedText = response.data.candidates[0].content.parts[0].text;
        console.log(`[GeminiProvider] Generated ${generatedText.length} characters`);
        return generatedText;
      }

      throw new Error('Invalid response format from Gemini API');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error?.message || error.message;
        console.error('[GeminiProvider] API Error:', errorMessage);
        console.error('[GeminiProvider] Status:', error.response?.status);

        if (error.response?.status === 401) {
          throw new Error('Invalid Gemini API key. Please check your GOOGLE_API_KEY.');
        }

        if (error.response?.status === 429) {
          throw new Error('Gemini API rate limit exceeded. Please try again later.');
        }

        throw new Error(`Gemini API error: ${errorMessage}`);
      }

      throw error;
    }
  }

  /**
   * Review code using Gemini API
   */
  async reviewCode(code: string): Promise<string> {
    console.log('[GeminiProvider] Reviewing code');

    const reviewPrompt = `
You are an expert code reviewer. Review the following code and provide feedback on:

1. Code quality and best practices
2. Potential bugs or issues
3. Performance considerations
4. Security vulnerabilities
5. Suggestions for improvement

Code to review:
\`\`\`
${code}
\`\`\`

Provide your review in a structured format with clear sections.
`;

    return this.generateCode(reviewPrompt);
  }

  /**
   * Get provider name
   */
  getName(): string {
    return 'Gemini';
  }

  /**
   * Get current model
   */
  getModel(): string {
    return this.model;
  }

  /**
   * Validate API connection
   */
  async validateConnection(): Promise<boolean> {
    console.log('[GeminiProvider] Validating API connection');

    try {
      // Make a simple request to validate the API key
      await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: 'Hello',
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 10,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 seconds timeout for validation
        }
      );

      console.log('[GeminiProvider] Connection validated successfully');
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[GeminiProvider] Connection validation failed:', error.response?.status);
        return false;
      }
      console.error('[GeminiProvider] Connection validation error:', error);
      return false;
    }
  }
}
