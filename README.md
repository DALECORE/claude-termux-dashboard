# Claude Termux Dashboard

**Full-featured terminal CLI** combining Termux environment control, Claude AI chat, and GitHub authentication with local service health monitoring.

## Features

### 🖥️ Dashboard
- Real-time system overview
- Service health checks (llama.cpp, Payment API)
- Component status monitoring
- Quick action shortcuts

### 🔧 Termux Controls
- Environment variable inspection
- Custom command execution
- Terminal shortcuts reference
- Kali mode switching
- Command history browsing

### 🤖 Claude AI Chat
- Conversational interface
- Termux-aware system prompts
- Session persistence
- Multi-turn conversations
- Context-aware responses

### 🐙 GitHub Integration
- OAuth authentication (Device Flow & PAT)
- User profile viewing
- Repository listing
- Activity feed
- Secure token handling

### 🏥 System Health
- CPU & Memory monitoring
- Local service status
- Service connectivity checks
- Health indicators

## Installation

```bash
git clone https://github.com/DALECORE/claude-termux-dashboard.git
cd claude-termux-dashboard
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Configure your API keys:
   ```env
   ANTHROPIC_API_KEY=sk-ant-...
   GITHUB_TOKEN=ghp_...  # Optional
   LLAMA_API_URL=http://localhost:8000
   PAYMENT_API_URL=http://localhost:3001
   ```

## Usage

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Run
```bash
npm start
```

## Main Menu

```
1. Dashboard (overview)
2. Termux controls
3. GitHub auth
4. Claude chat
5. System health
6. Local services
7. Settings
8. Exit
```

## Claude Chat Examples

```
You: How do I check disk space in Termux?
Claude: In Termux, use: df -h
        This shows all mounted filesystems with free space.

You: What are my GitHub repositories?
Claude: [Lists your 10 most recent repos]

You: Summarize system health
Claude: [Analyzes CPU, memory, services]
```

## Architecture

```
src/
├── cli.ts                 # Main entry point
├── config.ts              # Configuration loader
├── dashboard.ts           # Dashboard UI
├── termux/
│   └── controller.ts      # Termux controls
├── github/
│   └── controller.ts      # GitHub auth & API
└── ai/
    └── claude.ts          # Claude chat integration
```

## Local Services

### llama.cpp Server
```bash
# Start on port 8000
llama-server -m model.gguf -ngl 33
```

### Payment API
```bash
# Start on port 3001
node payment-api.js
```

## API Integration

### Anthropic Claude
- Model: `claude-3-5-sonnet-20241022`
- Context-aware system prompts
- Conversation history tracking

### GitHub
- Uses `@octokit/rest`
- Supports Device Flow and PAT authentication
- Real-time user & repo data

### Local Services
- Health check endpoints
- Service status monitoring
- Timeout-aware requests

## Security

- ✅ API keys stored in `.env` (Git-ignored)
- ✅ GitHub tokens kept server-side
- ✅ No credential logging
- ✅ Secure session handling
- ✅ HTTPS recommended for production

## Troubleshooting

### "ANTHROPIC_API_KEY not set"
```bash
echo "ANTHROPIC_API_KEY=your-key" >> .env
```

### "Service offline"
Check that llama.cpp and Payment API are running on configured ports.

### "GitHub authentication failed"
- Use Device Flow for app authorization
- Or provide valid PAT token

## Development Roadmap

- [ ] Database persistence (SQLite)
- [ ] Command history search
- [ ] Custom shortcuts configuration
- [ ] Plugin system
- [ ] Web UI companion
- [ ] Mobile app wrapper
- [ ] Advanced analytics

## License

Open source - DALECORE

## Contributing

Pull requests welcome! Please follow TypeScript best practices and add tests for new features.
