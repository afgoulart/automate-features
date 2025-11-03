import { GitHubAPI } from '../integrations/GitHubAPI';

interface BranchOptions {
  owner: string;
  repo: string;
  baseBranch?: string;
}

/**
 * Generator for creating Git branches
 */
export class BranchGenerator {
  private githubAPI: GitHubAPI;

  constructor(githubToken: string) {
    this.githubAPI = new GitHubAPI(githubToken);
  }

  /**
   * Create a new branch
   */
  async create(branchName: string, options: BranchOptions): Promise<void> {
    await this.githubAPI.createBranch(options.owner, options.repo, branchName, options.baseBranch);
  }
}
