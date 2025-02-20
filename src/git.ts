import { SimpleGit, simpleGit } from 'simple-git';
import chalk from 'chalk';

export class GitClient {
  private git: SimpleGit;
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.git = simpleGit(projectPath);
  }

  async validateRepository(): Promise<void> {
    const isRepo = await this.git.checkIsRepo();
    if (!isRepo) {
      throw new Error('Not a git repository');
    }
  }

  async getDiff(): Promise<string> {
    const status = await this.git.status();
    
    console.log(chalk.blue(`Found ${status.files.length} changed files`));
    
    if (status.files.length === 0) {
      throw new Error('No changes detected in the repository');
    }

    console.log('Getting diffs...');
    
    const stagedDiff = await this.git.diff(['--cached']);
    const unstagedDiff = await this.git.diff();

    const combinedDiff = [stagedDiff, unstagedDiff].filter(Boolean).join('\n');
    console.log(`Total diff length: ${combinedDiff.length} characters`);
    
    return combinedDiff;
  }
}