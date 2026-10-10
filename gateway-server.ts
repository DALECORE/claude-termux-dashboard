import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const app = express();
app.use(express.json());

const PORT = process.env.GATEWAY_PORT || 3000;
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ChatRequest {
  prompt: string;
  model?: string;
  max_tokens?: number;
  system?: string;
  temperature?: number;
}

interface ChatResponse {
  message: string;
  model: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  timestamp: string;
}

app.post('/chat', async (req, res) => {
  try {
    const { prompt, model = 'claude-3-5-sonnet-20241022', max_tokens = 1024 } = req.body as ChatRequest;

    if (!prompt) {
      res.status(400).json({ error: 'Missing prompt' });
      return;
    }

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

    const data: ChatResponse = {
      message,
      model,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
      timestamp: new Date().toISOString(),
    };

    res.json(data);
  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({
      error: error.message,
    });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`\n🔗 Anthropic Gateway running on http://localhost:${PORT}`);
  console.log('   POST /chat   - Send prompt to Claude');
  console.log('   GET /health  - Health check\n');
});
