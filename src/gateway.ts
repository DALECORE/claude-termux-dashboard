import { config } from './config.js';

export interface GatewayRequest {
  prompt: string;
  model?: string;
  max_tokens?: number;
  system?: string;
  temperature?: number;
}

export interface GatewayResponse {
  message: string;
  model?: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  timestamp?: string;
}

export class GatewayClient {
  private baseUrl: string;
  private apiKey: string | null;
  private token: string | null;

  constructor() {
    this.baseUrl = config.gatewayUrl;
    this.apiKey = config.gatewayApiKey || null;
    this.token = config.gatewayToken || null;
  }

  async sendPrompt(request: GatewayRequest): Promise<GatewayResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Gateway error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as GatewayResponse;
      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${config.timeoutMs}ms`);
      }
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  getUrl(): string {
    return this.baseUrl;
  }
}
