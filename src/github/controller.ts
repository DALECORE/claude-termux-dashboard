import chalk from 'chalk';
import { Octokit } from '@octokit/rest';

export class GitHubController {
  private octokit: Octokit | null = null;
  private token: string | null = process.env.GITHUB_TOKEN || null;

  async menu(): Promise<void> {
    console.clear();
    console.log(chalk.cyan.bold('\n=== GitHub Auth & Controls ===\n'));

    const { createInterface } = await import('readline');
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    let running = true;
    while (running) {
      const status = this.token ? chalk.green('Connected') : chalk.red('Not Connected');
      console.log(`Status: ${status}\n`);
      console.log('1. Login with GitHub');
      console.log('2. View user profile');
      console.log('3. List repositories');
      console.log('4. Recent activity');
      console.log('5. Logout');
      console.log('6. Back to menu\n');

      const choice = await new Promise<string>((resolve) => {
        rl.question(chalk.yellow('Select: '), resolve);
      });

      switch (choice.trim()) {
        case '1':
          await this.login();
          break;
        case '2':
          await this.viewProfile();
          break;
        case '3':
          await this.listRepos();
          break;
        case '4':
          await this.viewActivity();
          break;
        case '5':
          this.logout();
          break;
        case '6':
          running = false;
          break;
        default:
          console.log(chalk.red('Invalid option'));
      }
    }

    rl.close();
  }

  private async login(): Promise<void> {
    console.clear();
    console.log(chalk.cyan('GitHub Authentication\n'));
    console.log('1. Use existing token (PAT)');
    console.log('2. Device flow (recommended)');
    console.log('3. Cancel\n');

    const { createInterface } = await import('readline');
    const rl = createInterface({ input: process.stdin, output: process.stdout });

    const choice = await new Promise<string>((resolve) => {
      rl.question(chalk.yellow('Select: '), resolve);
    });
    rl.close();

    if (choice === '1') {
      const { createInterface: createInterface2 } = await import('readline');
      const rl2 = createInterface({ input: process.stdin, output: process.stdout });
      this.token = await new Promise<string>((resolve) => {
        rl2.question(chalk.yellow('Enter PAT: '), resolve);
      });
      rl2.close();

      if (this.token) {
        this.octokit = new Octokit({ auth: this.token });
        console.log(chalk.green('✓ Authenticated!'));
      }
    } else if (choice === '2') {
      console.log(chalk.yellow('\nDevice flow setup:'));
      console.log('1. Visit: https://github.com/login/device');
      console.log('2. Enter the code shown');
      console.log('3. Authorize the application');
      console.log('\nDevice flow implementation coming soon...\n');
    }
  }

  private async viewProfile(): Promise<void> {
    if (!this.octokit) {
      console.log(chalk.red('\nNot authenticated. Please login first.\n'));
      return;
    }

    try {
      console.log(chalk.cyan('\nFetching profile...'));
      const { data } = await this.octokit.users.getAuthenticated();
      console.log(chalk.green('\n✓ User Profile:'));
      console.log(`  Name: ${data.name}`);
      console.log(`  Login: ${data.login}`);
      console.log(`  Bio: ${data.bio}`);
      console.log(`  Public repos: ${data.public_repos}`);
      console.log(`  Followers: ${data.followers}\n`);
    } catch (error) {
      console.log(chalk.red('Error fetching profile\n'));
    }
  }

  private async listRepos(): Promise<void> {
    if (!this.octokit) {
      console.log(chalk.red('\nNot authenticated. Please login first.\n'));
      return;
    }

    try {
      console.log(chalk.cyan('\nFetching repositories...'));
      const { data } = await this.octokit.repos.listForAuthenticatedUser({ per_page: 10 });
      console.log(chalk.green('\n✓ Recent Repositories:'));
      for (const repo of data) {
        console.log(`  • ${repo.name} ${chalk.gray(`(${repo.language || 'no lang'}`)}`);
      }
      console.log('');
    } catch (error) {
      console.log(chalk.red('Error fetching repositories\n'));
    }
  }

  private async viewActivity(): Promise<void> {
    if (!this.octokit) {
      console.log(chalk.red('\nNot authenticated. Please login first.\n'));
      return;
    }

    try {
      console.log(chalk.cyan('\nFetching activity...'));
      const { data } = await this.octokit.activity.listEventsForAuthenticatedUser({ per_page: 5 });
      console.log(chalk.green('\n✓ Recent Activity:'));
      for (const event of data) {
        console.log(`  • ${event.type} on ${event.repo.name}`);
      }
      console.log('');
    } catch (error) {
      console.log(chalk.red('Error fetching activity\n'));
    }
  }

  private logout(): void {
    this.token = null;
    this.octokit = null;
    console.log(chalk.green('\n✓ Logged out!\n'));
  }
}
