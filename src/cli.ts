#!/usr/bin/env node
import 'dotenv/config';
import chalk from 'chalk';
import { createInterface } from 'readline';
import { GatewayClient } from './gateway.js';
import { History } from './history.js';
import { config, validateConfig } from './config.js';
import { createSpinner } from 'ora';

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
  historySize: 50,
});

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    readline.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  if (!validateConfig()) {
    process.exit(1);
  }

  console.clear();
  console.log(chalk.green.bold('\n🚀 Anthropic Gateway CLI\n'));
  console.log(chalk.gray(`Gateway: ${config.gatewayUrl}\n`));

  const gateway = new GatewayClient();
  const history = new History(config.historyFile, config.maxHistory);

  // Load history
  await history.load();

  // Check gateway health
  const spinner = createSpinner('Checking gateway...').start();
  const isHealthy = await gateway.healthCheck();
  if (isHealthy) {
    spinner.succeed(chalk.green('Gateway is online'));
  } else {
    spinner.warn(chalk.yellow('Gateway might be offline'));
  }

  console.log(
    chalk.gray('\nType "help" for commands, "exit" to quit, "history" to see prompts\n')
  );

  let running = true;

  while (running) {
    const input = await prompt(chalk.cyan('You> '));

    const trimmedInput = input.trim();

    if (!trimmedInput) continue;

    if (trimmedInput.toLowerCase() === 'exit') {
      running = false;
      console.log(chalk.green('\n👋 Goodbye!\n'));
      continue;
    }

    if (trimmedInput.toLowerCase() === 'help') {
      showHelp();
      continue;
    }

    if (trimmedInput.toLowerCase() === 'history') {
      showHistory(history);
      continue;
    }

    if (trimmedInput.toLowerCase() === 'clear') {
      console.clear();
      continue;
    }

    // Send to gateway
    const spin = createSpinner('Waiting for response...').start();

    try {
      const response = await gateway.sendPrompt({
        prompt: trimmedInput,
      });

      spin.succeed();
      console.log(chalk.green('\nClaude:'));
      console.log(chalk.white(response.message));

      if (response.usage) {
        console.log(
          chalk.gray(
            `\n📊 Tokens: input=${response.usage.input_tokens}, output=${response.usage.output_tokens}`
          )
        );
      }

      console.log('');

      // Save to history
      await history.add(trimmedInput);
    } catch (error: any) {
      spin.fail(chalk.red('Error'));
      console.log(chalk.red(`Error: ${error.message}\n`));
    }
  }

  readline.close();
}

function showHelp(): void {
  console.log(chalk.cyan.bold('\nAvailable Commands:\n'));
  console.log('  help       - Show this help message');
  console.log('  history    - Show last 10 prompts');
  console.log('  clear      - Clear screen');
  console.log('  exit       - Exit the CLI\n');
  console.log(chalk.gray('Just type your prompt to send it to Claude via the gateway.\n'));
}

function showHistory(history: History): void {
  console.log(chalk.cyan.bold('\nRecent Prompts:\n'));
  const items = history.getLast(10);
  items.forEach((item, i) => {
    console.log(`  ${i + 1}. ${chalk.gray(item)}`);
  });
  console.log('');
}

main().catch(console.error);
