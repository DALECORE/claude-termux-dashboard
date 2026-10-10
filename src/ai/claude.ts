import chalk from 'chalk';
import Anthropic from '@anthropic-ai/sdk';
import * as readline from 'readline';

export class ClaudeController {
  private client: Anthropic;
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  private rl: readline.Interface | null = null;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not set');
    }
    this.client = new Anthropic({ apiKey });
  }

  async menu(): Promise<void> {
    console.clear();
    console.log(chalk.cyan.bold('\n=== Claude AI Chat ===\n'));

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    let running = true;
    while (running) {
      console.log(chalk.yellow('\nOptions:'));
      console.log('1. Start chat');
      console.log('2. System context');
      console.log('3. Clear history');
      console.log('4. Save session');
      console.log('5. Help');
      console.log('6. Back to menu\n');

      const choice = await this.promptInput(chalk.yellow('Select: '));

      switch (choice.trim()) {
        case '1':
          await this.chat();
          break;
        case '2':
          this.showContext();
          break;
        case '3':
          this.clearHistory();
          console.log(chalk.green('✓ History cleared'));
          break;
        case '4':
          await this.saveSession();
          break;
        case '5':
          this.showHelp();
          break;
        case '6':
          running = false;
          break;
        default:
          console.log(chalk.red('Invalid option'));
      }
    }

    if (this.rl) {
      this.rl.close();
    }
  }

  private async chat(): Promise<void> {
    console.clear();
    console.log(chalk.cyan.bold('Chat with Claude'));
    console.log(chalk.gray('Type "exit" to return to menu, "clear" to clear history\n'));

    let chatRunning = true;
    while (chatRunning) {
      const userInput = await this.promptInput(chalk.blue('You: '));

      if (userInput.toLowerCase() === 'exit') {
        chatRunning = false;
        break;
      }

      if (userInput.toLowerCase() === 'clear') {
        this.clearHistory();
        console.log(chalk.green('✓ History cleared\n'));
        continue;
      }

      if (!userInput.trim()) {
        continue;
      }

      try {
        const response = await this.getResponse(userInput);
        console.log(chalk.green('Claude:'), response, '\n');
      } catch (error: any) {
        console.log(chalk.red('Error:'), error.message, '\n');
      }
    }
  }

  private async getResponse(userMessage: string): Promise<string> {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: this.getSystemPrompt(),
      messages: this.conversationHistory,
    });

    const assistantMessage =
      response.content[0].type === 'text' ? response.content[0].text : 'Unable to process response';

    this.conversationHistory.push({
      role: 'assistant',
      content: assistantMessage,
    });

    return assistantMessage;
  }

  private getSystemPrompt(): string {
    return `You are Claude, an AI assistant running in a Termux terminal environment. You have access to:
- Termux/Kali environment information
- GitHub repositories and user data (when authenticated)
- Local AI model (llama.cpp) status
- System health metrics

Provide concise, helpful responses suitable for terminal display. Format code snippets clearly.
When discussing system commands, provide clear examples that work in Termux/bash.
Be aware of mobile/ARM architecture limitations when suggesting commands.`;
  }

  private showContext(): void {
    console.clear();
    console.log(chalk.cyan.bold('\nSystem Context:\n'));
    console.log('Environment: Termux (Android)');
    console.log(`Messages: ${this.conversationHistory.length}`);
    console.log('Model: Claude 3.5 Sonnet');
    console.log('Available resources:');
    console.log('  • Termux file system');
    console.log('  • GitHub API (if authenticated)');
    console.log('  • Local llama.cpp server');
    console.log('  • System commands & shell\n');
  }

  private clearHistory(): void {
    this.conversationHistory = [];
  }

  private async saveSession(): Promise<void> {
    const filename = `claude-session-${Date.now()}.json`;
    const fs = await import('fs/promises');
    try {
      await fs.writeFile(
        filename,
        JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            messages: this.conversationHistory,
          },
          null,
          2
        )
      );
      console.log(chalk.green(`✓ Session saved to ${filename}\n`));
    } catch (error: any) {
      console.log(chalk.red(`Error saving session: ${error.message}\n`));
    }
  }

  private showHelp(): void {
    console.clear();
    console.log(chalk.cyan.bold('\nClaude Chat Help:\n'));
    console.log('Commands:');
    console.log('  exit      - Return to menu');
    console.log('  clear     - Clear conversation history');
    console.log('  /system   - Show system context');
    console.log('  /save     - Save session to file');
    console.log('\nTips:');
    console.log('  • Ask for Termux command help');
    console.log('  • Discuss GitHub repository details');
    console.log('  • Get code reviews and suggestions');
    console.log('  • Troubleshoot system issues\n');
  }

  private promptInput(question: string): Promise<string> {
    return new Promise((resolve) => {
      if (!this.rl) {
        resolve('');
        return;
      }
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }
}
