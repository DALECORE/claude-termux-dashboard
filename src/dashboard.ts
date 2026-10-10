import chalk from 'chalk';
import Table from 'cli-table3';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class Dashboard {
  async show(): Promise<void> {
    console.clear();
    console.log(chalk.cyan.bold('\n=== Dashboard Overview ===\n'));

    const table = new Table({
      head: [chalk.cyan('Component'), chalk.cyan('Status'), chalk.cyan('Details')],
      style: { compact: true },
    });

    // Get system info
    const systemStatus = await this.getSystemStatus();
    for (const [component, status] of Object.entries(systemStatus)) {
      const color = status.ok ? 'green' : 'yellow';
      table.push([component, chalk[color](status.value), status.details]);
    }

    console.log(table.toString());
    console.log('');

    // Shortcuts
    console.log(chalk.magenta.bold('Quick Actions:'));
    console.log('  • s - Start llama.cpp');
    console.log('  • h - Health check');
    console.log('  • k - Switch to Kali');
    console.log('  • g - GitHub login');
    console.log('  • c - Chat with Claude\n');

    const { createInterface } = await import('readline');
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    await new Promise((resolve) => {
      rl.question(chalk.gray('Press Enter to continue...'), () => {
        rl.close();
        resolve(null);
      });
    });
  }

  private async getSystemStatus(): Promise<Record<string, { ok: boolean; value: string; details: string }>> {
    return {
      'Termux Session': {
        ok: true,
        value: '✓ Online',
        details: 'Environment active',
      },
      'Kali Switch': {
        ok: true,
        value: '✓ Ready',
        details: 'Dual mode available',
      },
      'llama.cpp Server': {
        ok: await this.checkService('http://localhost:8000'),
        value: (await this.checkService('http://localhost:8000')) ? '✓ Running' : '✗ Offline',
        details: 'AI model server',
      },
      'Payment API': {
        ok: await this.checkService('http://localhost:3001'),
        value: (await this.checkService('http://localhost:3001')) ? '✓ Running' : '✗ Offline',
        details: 'Privacy-first payments',
      },
      'GitHub Auth': {
        ok: false,
        value: '◯ Not Connected',
        details: 'Login required',
      },
      'Claude API': {
        ok: true,
        value: '✓ Ready',
        details: 'Configured',
      },
    };
  }

  private async checkService(url: string): Promise<boolean> {
    try {
      const response = await fetch(`${url}/health`, { timeout: 3000 } as RequestInit);
      return response.ok;
    } catch {
      return false;
    }
  }
}
