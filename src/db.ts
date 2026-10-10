import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';

const dbDir = path.join(process.env.HOME || '.', '.dashboard');

export class Database {
  private db: sqlite3.Database | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const dbPath = path.join(dbDir, 'dashboard.db');
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) reject(err);
        else this.setupTables().then(resolve).catch(reject);
      });
    });
  }

  private async setupTables(): Promise<void> {
    const run = promisify(this.db!.run.bind(this.db));

    await run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        messages TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS shortcuts (
        id TEXT PRIMARY KEY,
        command TEXT,
        alias TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async saveSession(id: string, messages: any[]): Promise<void> {
    const run = promisify(this.db!.run.bind(this.db));
    await run('INSERT OR REPLACE INTO sessions VALUES (?, ?, CURRENT_TIMESTAMP)', [
      id,
      JSON.stringify(messages),
    ]);
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
