import 'dotenv/config';

export const config = {
  gatewayUrl: process.env.GATEWAY_URL || 'http://localhost:3000',
  gatewayApiKey: process.env.GATEWAY_API_KEY || '',
  gatewayToken: process.env.GATEWAY_TOKEN || '',
  historyFile: process.env.CLI_HISTORY_FILE || './.cli-history',
  maxHistory: parseInt(process.env.CLI_MAX_HISTORY || '100'),
  timeoutMs: parseInt(process.env.CLI_TIMEOUT_MS || '30000'),
};

export function validateConfig(): boolean {
  if (!config.gatewayUrl) {
    console.error('Error: GATEWAY_URL not configured');
    return false;
  }
  return true;
}
