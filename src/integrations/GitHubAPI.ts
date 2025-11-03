import axios, { AxiosInstance } from 'axios';

/**
 * Integration with GitHub API
 */
export class GitHubAPI {
  private apiClient: AxiosInstance;

  constructor(apiToken: string) {
    if (!apiToken) {
      throw new Error('GitHub API token is required');
    }

    this.apiClient = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Authorization: `token ${apiToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
  }

  /**
   * Create a branch
   */
  async createBranch(
    owner: string,
    repo: string,
    branchName: string,
    baseBranch: string = 'main'
  ): Promise<void> {
    try {
      // Get base branch SHA
      const baseResponse = await this.apiClient.get(
        `/repos/${owner}/${repo}/git/refs/heads/${baseBranch}`
      );
      const baseSha = baseResponse.data.object.sha;

      // Create new branch
      await this.apiClient.post(`/repos/${owner}/${repo}/git/refs`, {
        ref: `refs/heads/${branchName}`,
        sha: baseSha,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`GitHub API error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Create an issue
   */
  async createIssue(
    owner: string,
    repo: string,
    title: string,
    body: string,
    labels?: string[]
  ): Promise<{ number: number }> {
    try {
      const response = await this.apiClient.post(`/repos/${owner}/${repo}/issues`, {
        title,
        body,
        labels,
      });

      return {
        number: response.data.number,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`GitHub API error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Create a Pull Request
   */
  async createPR(
    owner: string,
    repo: string,
    title: string,
    body: string,
    head: string,
    base: string = 'main'
  ): Promise<{ number: number }> {
    try {
      const response = await this.apiClient.post(`/repos/${owner}/${repo}/pulls`, {
        title,
        body,
        head,
        base,
      });

      return {
        number: response.data.number,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`GitHub API error: ${error.message}`);
      }
      throw error;
    }
  }
}
