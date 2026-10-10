import fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

export class History {
  private filePath: string;
  private maxItems: number;
  private items: string[] = [];

  constructor(filePath: string, maxItems: number = 100) {
    this.filePath = filePath;
    this.maxItems = maxItems;
  }

  async load(): Promise<void> {
    try {
      const data = await readFile(this.filePath, 'utf-8');
      this.items = data
        .split('\n')
        .filter((line) => line.trim())
        .slice(-this.maxItems);
    } catch {
      // File doesn't exist yet, start empty
      this.items = [];
    }
  }

  async add(prompt: string): Promise<void> {
    this.items.push(prompt);
    if (this.items.length > this.maxItems) {
      this.items = this.items.slice(-this.maxItems);
    }
    await this.save();
  }

  private async save(): Promise<void> {
    await writeFile(this.filePath, this.items.join('\n'), 'utf-8');
  }

  getAll(): string[] {
    return this.items;
  }

  getLast(n: number = 10): string[] {
    return this.items.slice(-n);
  }
}
