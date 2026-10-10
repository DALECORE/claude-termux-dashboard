#!/usr/bin/env node
import 'dotenv/config';
import { createInterface } from 'readline';
import chalk from 'chalk';
import { Dashboard } from './dashboard.js';
import { TermuxController } from './termux/controller.js';
import { GitHubController } from './github/controller.js';
import { ClaudeController } from './ai/claude.js';
import { Config } from './config.js';

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    readline.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.clear();
  console.log(chalk.green.bold('\n🚀 DALECORE Terminal Dashboard\n'));
  console.log(chalk.gray('Termux • Claude • GitHub • Local Services\n'));

  const config = new Config();
  const dashboard = new Dashboard();
  const termux = new TermuxController();
  const github = new GitHubController();
  const claude = new ClaudeController();

  let running = true;

  while (running) {
    console.log(chalk.cyan.bold('\n=== Main Menu ===\n'));
    console.log('1. Dashboard (overview)');
    console.log('2. Termux controls');
    console.log('3. GitHub auth');
    console.log('4. Claude chat');
    console.log('5. System health');
    console.log('6. Local services');
    console.log('7. Settings');
    console.log('8. Exit\n');

    const choice = await prompt(chalk.yellow('Select option: '));

    switch (choice.trim()) {
      case '1':
        await dashboard.show();
        break;
      case '2':
        await termux.menu();
        break;
      case '3':
        await github.menu();
        break;
      case '4':
        await claude.menu();
        break;
      case '5':
        await showSystemHealth();
        break;
      case '6':
        await showLocalServices(config);
        break;
      case '7':
        await showSettings(config);
        break;
      case '8':
        running = false;
        console.log(chalk.green('\n👋 Goodbye!\n'));
        break;
      default:
        console.log(chalk.red('Invalid option. Try again.'));
    }
  }

  readline.close();
}

async function showSystemHealth() {
  console.clear();
  console.log(chalk.cyan.bold('\n=== System Health ===\n'));

  const osUtils = await import('os-utils');

  osUtils.cpuUsage((v: number) => {
    console.log(`CPU Usage: ${(v * 100).toFixed(1)}%`);
  });

  console.log(`Memory: ${osUtils.totalmem() / 1024 / 1024 / 1024}GB total`);
  console.log(`Free RAM: ${osUtils.freemem() / 1024 / 1024}MB`);

  const { exec } = await import('child_process');
  exec('uname -a', (err, stdout) => {
    if (!err) console.log(`System: ${stdout}`);
  });

  await prompt(chalk.gray('Press Enter to continue...'));
}

async function showLocalServices(config: Config) {
  console.clear();
  console.log(chalk.cyan.bold('\n=== Local Services Health ===\n'));

  const services = [
    { name: 'llama.cpp', url: config.llamaUrl },
    { name: 'Payment API', url: config.paymentUrl },
  ];

  for (const service of services) {
    try {
      const response = await fetch(`${service.url}/health`, {
        timeout: 5000,
      } as RequestInit);
      console.log(`${service.name}: ${response.ok ? chalk.green('✓ OK') : chalk.red('✗ Failed')}`);
    } catch (e) {
      console.log(`${service.name}: ${chalk.red('✗ Offline')}`);
    }
  }

  await prompt(chalk.gray('Press Enter to continue...'));
}

async function showSettings(config: Config) {
  console.clear();
  console.log(chalk.cyan.bold('\n=== Settings ===\n'));
  console.log(`Termux mode: ${config.termuxMode ? chalk.green('ON') : chalk.red('OFF')}`);
  console.log(`Kali available: ${config.kaliAvailable ? chalk.green('YES') : chalk.red('NO')}`);
  console.log(`llama.cpp: ${config.llamaUrl}`);
  console.log(`Payment API: ${config.paymentUrl}\n`);

  const choice = await prompt(chalk.yellow('Edit settings? (y/n): '));
  if (choice.toLowerCase() === 'y') {
    console.log('Settings editor coming soon...');
  }
}

main().catch(console.error);
