import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';
import Table from 'cli-table3';

const execAsync = promisify(exec);

export class TermuxController {
  async menu(): Promise<void> {
    console.clear();
    console.log(chalk.cyan.bold('\n=== Termux Controls ===\n'));

    const { createInterface } = await import('readline');
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    let running = true;
    while (running) {
      console.log(chalk.yellow('Options:'));
      console.log('1. Show environment');
      console.log('2. Run custom command');
      console.log('3. View shortcuts');
      console.log('4. Switch to Kali');
      console.log('5. Command history');
      console.log('6. Back to menu\n');

      const choice = await new Promise<string>((resolve) => {
        rl.question(chalk.yellow('Select: '), resolve);
      });

      switch (choice.trim()) {
        case '1':
          await this.showEnvironment();
          break;
        case '2':
          await this.runCommand(rl);
          break;
        case '3':
          await this.showShortcuts();
          break;
        case '4':
          await this.switchToKali();
          break;
        case '5':
          await this.showHistory();
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

  private async showEnvironment(): Promise<void> {
    console.clear();
    console.log(chalk.cyan('Environment Variables:\n'));

    const env = process.env;
    const table = new Table({
      head: [chalk.cyan('Variable'), chalk.cyan('Value')],
      style: { compact: true },
    });

    const important = ['PATH', 'HOME', 'USER', 'SHELL', 'TERM'];
    for (const key of important) {
      if (env[key]) {
        table.push([key, env[key]!.substring(0, 50)]);
      }
    }

    console.log(table.toString());
    console.log('');
  }

  private async runCommand(rl: any): Promise<void> {
    const cmd = await new Promise<string>((resolve) => {
      rl.question(chalk.yellow('Command to run: '), resolve);
    });

    try {
      const { stdout, stderr } = await execAsync(cmd, { maxBuffer: 10 * 1024 * 1024 });
      console.log(chalk.green('Output:'));
      console.log(stdout);
      if (stderr) console.log(chalk.red('Errors:'), stderr);
    } catch (error: any) {
      console.log(chalk.red('Error:'), error.message);
    }
  }

  private async showShortcuts(): Promise<void> {
    console.clear();
    console.log(chalk.cyan.bold('Termux Shortcuts:\n'));
    console.log('Ctrl+A  → Start of line');
    console.log('Ctrl+E  → End of line');
    console.log('Ctrl+K  → Kill to end of line');
    console.log('Ctrl+L  → Clear screen');
    console.log('Ctrl+W  → Delete word');
    console.log('Vol+E   → Open menu (on device)');
    console.log('');
  }

  private async switchToKali(): Promise<void> {
    console.log(chalk.yellow('\nSwitching to Kali...'));
    console.log('Note: Requires chroot environment or WSL2');
    console.log('Command: chroot /path/to/kali /bin/bash');
    console.log('');
  }

  private async showHistory(): Promise<void> {
    console.clear();
    console.log(chalk.cyan.bold('Command History:\n'));
    try {
      const { stdout } = await execAsync('history | tail -20');
      console.log(stdout);
    } catch {
      console.log('History not available');
    }
    console.log('');
  }
}
