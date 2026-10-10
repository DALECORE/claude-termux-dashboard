# Anthropic Gateway CLI

A simple terminal CLI that sends prompts to **your custom Anthropic gateway service** instead of directly calling the Anthropic API.

## Why a Gateway?

- **Centralized control** - manage all API calls through your own service
- **Logging & monitoring** - track usage and patterns
- **Rate limiting** - enforce quotas per user/API key
- **Cost control** - monitor and limit spending
- **Caching** - avoid duplicate API calls
- **Transformation** - modify requests/responses
- **Authentication** - add your own auth layer
- **Multi-model routing** - switch between Claude versions dynamically

## Quick Start

### 1. Install

```bash
git clone https://github.com/DALECORE/anthropic-gateway-cli.git
cd anthropic-gateway-cli
npm install
```

### 2. Configure

```bash
cp .env.example .env
```

Edit `.env`:

```env
GATEWAY_URL=http://localhost:3000          # Your gateway service URL
GATEWAY_API_KEY=your-api-key               # Optional: API key for gateway
GATEWAY_TOKEN=your-bearer-token            # Optional: Bearer token for gateway
CLI_HISTORY_FILE=./.cli-history            # Where to store prompt history
CLI_MAX_HISTORY=100                        # Max prompts to keep
CLI_TIMEOUT_MS=30000                       # Request timeout
```

### 3. Start Your Gateway Service

Before running the CLI, your gateway service must be running on the configured URL.

**Example Node.js gateway:**

```bash
# See gateway-server.ts (separate project)
node gateway-server.js
```

### 4. Run the CLI

```bash
npm run dev
```

## Usage

```
🚀 Anthropic Gateway CLI

Gateway: http://localhost:3000

Type "help" for commands, "exit" to quit, "history" to see prompts

You> What is Rust?
Claude:
Rust is a systems programming language...

📊 Tokens: input=4, output=150

You> help
Available Commands:

  help       - Show this help message
  history    - Show last 10 prompts
  clear      - Clear screen
  exit       - Exit the CLI

You> exit
👋 Goodbye!
```

## Commands

| Command | Description |
| --- | --- |
| `help` | Show available commands |
| `history` | Display last 10 prompts |
| `clear` | Clear terminal screen |
| `exit` | Exit the CLI |
| Any text | Send as prompt to gateway |

## Architecture

```
CLI (src/cli.ts)
  ↓
  Gateway Client (src/gateway.ts)
    ↓
    POST {GATEWAY_URL}/chat
      {
        "prompt": "user input",
        "model": "claude-3-5-sonnet-20241022",
        "max_tokens": 1024
      }
    ↓
  Your Gateway Service
    ↓
    Anthropic API
      ↓
    Claude Response
```

## Gateway Endpoint

Your gateway service must implement:

### POST /chat

**Request:**

```json
{
  "prompt": "Your prompt here",
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 1024,
  "system": "Optional system prompt",
  "temperature": 0.7
}
```

**Response:**

```json
{
  "message": "Claude's response here",
  "model": "claude-3-5-sonnet-20241022",
  "usage": {
    "input_tokens": 10,
    "output_tokens": 150
  },
  "timestamp": "2026-10-10T12:34:56Z"
}
```

### GET /health

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-10-10T12:34:56Z"
}
```

## Example Gateway Server (Node.js + Express)

Create `gateway-server.ts`:

```typescript
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const app = express();
app.use(express.json());

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.post('/chat', async (req, res) => {
  try {
    const { prompt, model = 'claude-3-5-sonnet-20241022', max_tokens = 1024 } = req.body;

    const response = await client.messages.create({
      model,
      max_tokens,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const message =
      response.content[0].type === 'text'
        ? response.content[0].text
        : 'Unable to process response';

    res.json({
      message,
      model,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message,
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(3000, () => {
  console.log('Gateway running on http://localhost:3000');
});
```

## Development

```bash
# Run in development
npm run dev

# Build
npm run build

# Run compiled version
npm start
```

## Security

- ✅ API keys stored in `.env` (Git-ignored)
- ✅ Configurable authentication headers
- ✅ HTTPS support (configure gateway URL)
- ✅ Timeout protection
- ✅ Error handling

## Features

- ✅ Interactive terminal chat
- ✅ Command history (persistent)
- ✅ Token usage display
- ✅ Health checks
- ✅ Timeout handling
- ✅ Error messages
- ✅ Gateway agnostic

## Roadmap

- [ ] Multi-turn conversation state
- [ ] System prompt customization
- [ ] Model selection from CLI
- [ ] Streaming responses
- [ ] Export conversations
- [ ] Configuration wizard
- [ ] Web UI companion

## Troubleshooting

### "Gateway might be offline"

Check that your gateway service is running:

```bash
curl http://localhost:3000/health
```

### "Request timeout"

Increase timeout in `.env`:

```env
CLI_TIMEOUT_MS=60000
```

### "Unauthorized"

Verify API key/token in `.env`:

```env
GATEWAY_API_KEY=your-valid-key
GATEWAY_TOKEN=your-valid-token
```

## License

Open source - DALECORE
