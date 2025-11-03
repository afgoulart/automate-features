import { GitHubAPI } from '../integrations/GitHubAPI';

interface PROptions {
  owner: string;
  repo: string;
  base?: string;
}

interface CreatePRParams {
  title: string;
  body: string;
  branch: string;
}

/**
 * Generator for creating Pull Requests
 */
export class PRGenerator {
  private githubAPI: GitHubAPI;

  constructor(githubToken: string) {
    this.githubAPI = new GitHubAPI(githubToken);
  }

  /**
   * Create a new Pull Request
   */
  async create(params: CreatePRParams, options: PROptions): Promise<{ number: number }> {
    return this.githubAPI.createPR(
      options.owner,
      options.repo,
      params.title,
      params.body,
      params.branch,
      options.base
    );
  }
}
