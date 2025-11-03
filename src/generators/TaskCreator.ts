import { GitHubAPI } from '../integrations/GitHubAPI';

interface TaskOptions {
  owner: string;
  repo: string;
  labels?: string[];
}

interface CreateTaskParams {
  title: string;
  description: string;
}

/**
 * Creator for GitHub Issues/Tasks
 */
export class TaskCreator {
  private githubAPI: GitHubAPI;

  constructor(githubToken: string) {
    this.githubAPI = new GitHubAPI(githubToken);
  }

  /**
   * Create a new task/issue
   */
  async create(params: CreateTaskParams, options: TaskOptions): Promise<{ number: number }> {
    return this.githubAPI.createIssue(
      options.owner,
      options.repo,
      params.title,
      params.description,
      options.labels
    );
  }
}
