export class Config {
  public apiKey: string;
  public githubToken: string | null;
  public llamaUrl: string;
  public paymentUrl: string;
  public termuxMode: boolean;
  public kaliAvailable: boolean;
  public refreshInterval: number;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    this.githubToken = process.env.GITHUB_TOKEN || null;
    this.llamaUrl = process.env.LLAMA_API_URL || 'http://localhost:8000';
    this.paymentUrl = process.env.PAYMENT_API_URL || 'http://localhost:3001';
    this.termuxMode = process.env.TERMUX_MODE !== 'false';
    this.kaliAvailable = process.env.KALI_AVAILABLE === 'true';
    this.refreshInterval = parseInt(process.env.DASHBOARD_REFRESH_INTERVAL || '5000');
  }

  validate(): boolean {
    if (!this.apiKey) {
      console.error('Error: ANTHROPIC_API_KEY not set');
      return false;
    }
    return true;
  }
}
