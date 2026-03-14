import axios from 'axios';
import CircuitBreaker, { AIResponse } from './CircuitBreaker';

export interface PromptContext {
  systemMessage: string;
  userMessage: string;
  campaignContext?: Record<string, any>;
  characterContext?: Record<string, any>;
  messageHistory?: Array<{ role: string; content: string }>;
}

export class AIService {
  private groqBreaker: CircuitBreaker;
  private ollamaBreaker: CircuitBreaker;

  private groqApiKey: string;
  private groqModel: string = 'llama-3.1-8b-instant';
  private groqApiUrl: string = 'https://api.groq.com/openai/v1/chat/completions';

  private ollamaUrl: string;
  private ollamaModel: string;

  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY || '';
    this.ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2:1b';

    this.groqBreaker = new CircuitBreaker(3, 2, 60000);
    this.ollamaBreaker = new CircuitBreaker(3, 2, 30000);
  }

  private async withRetry<T>(fn: () => Promise<T>, retries: number, delayMs: number): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        const status = error?.response?.status;
        const code = error?.code;
        const shouldRetry = status === 429 || (status >= 500 && status < 600) || code === 'ECONNRESET' || code === 'ECONNREFUSED' || code === 'ETIMEDOUT';
        if (!shouldRetry || attempt === retries) {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    throw lastError;
  }

  async generateDMResponse(context: PromptContext): Promise<AIResponse> {
    console.log('[AI Service] Generating DM response...');

    try {
      return await this.groqBreaker.execute(() => this.callGroq(context));
    } catch (groqError) {
      console.log('[AI Service] Groq failed, falling back to Ollama...');
      console.error('[Groq Error]', (groqError as Error).message);

      try {
        return await this.ollamaBreaker.execute(() => this.callOllama(context));
      } catch (ollamaError) {
        console.error('[Ollama Error]', (ollamaError as Error).message);
        throw new Error(
          'Both Groq and Ollama failed. Unable to generate AI response.',
        );
      }
    }
  }

  private async callGroq(context: PromptContext): Promise<AIResponse> {
    if (!this.groqApiKey || this.groqApiKey === 'your-groq-api-key') {
      throw new Error('GROQ_API_KEY not configured or is still a placeholder');
    }

    console.log('[Groq] Sending request...');

    const messages = [
      {
        role: 'system',
        content: context.systemMessage,
      },
      ...(context.messageHistory || []),
      {
        role: 'user',
        content: context.userMessage,
      },
    ];

    try {
      const response = await this.withRetry(
        () =>
          axios.post(
            this.groqApiUrl,
            {
              model: this.groqModel,
              messages,
              temperature: 0.8,
              max_tokens: 1024,
            },
            {
              headers: {
                Authorization: `Bearer ${this.groqApiKey}`,
                'Content-Type': 'application/json',
              },
              timeout: 30000,
            },
          ),
        2,
        800,
      );

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from Groq');
      }

      console.log('[Groq] Response received successfully');

      return {
        content,
        model: this.groqModel,
        source: 'groq',
        tokensUsed: response.data.usage?.total_tokens,
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error('[Groq API Error]', error.response?.data || error.message);
      throw error;
    }
  }

  private async callOllama(context: PromptContext): Promise<AIResponse> {
    console.log('[Ollama] Sending request to:', this.ollamaUrl);

    const systemPrompt = `${context.systemMessage}\n\nContexto da Campanha: ${JSON.stringify(context.campaignContext || {})}`;

    try {
      const response = await this.withRetry(
        () =>
          axios.post(
            `${this.ollamaUrl}/api/generate`,
            {
              model: this.ollamaModel,
              prompt: `${systemPrompt}\n\nUsuário: ${context.userMessage}\n\nOráculo:`,
              stream: false,
              temperature: 0.8,
            },
            {
              timeout: 120000,
            },
          ),
        1,
        1000,
      );

      const content = response.data.response?.trim();
      if (!content) {
        throw new Error('Empty response from Ollama');
      }

      console.log('[Ollama] Response received successfully');

      return {
        content,
        model: this.ollamaModel,
        source: 'ollama',
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error('[Ollama API Error]', error.message);
      if (error.response) {
        console.error('[Ollama Error Response]', error.response.data);
      }
      if (error.code === 'ECONNREFUSED') {
        console.error(`[Ollama] Verifique se o serviço está rodando em ${this.ollamaUrl}`);
      }
      throw error;
    }
  }

  async generateNarrative(campaignDetails: string): Promise<AIResponse> {
    const context: PromptContext = {
      systemMessage: `You are a Dungeon Master for D&D 5th Edition. Create engaging, descriptive narratives that immerse players in the game world. Use vivid descriptions and make decisions based on the rules provided.`,
      userMessage: `Generate an engaging narrative scene for this campaign: ${campaignDetails}`,
    };

    return this.generateDMResponse(context);
  }

  async generateMonsterAction(monsterName: string, situation: string): Promise<AIResponse> {
    const context: PromptContext = {
      systemMessage: `You are a tactical Dungeon Master. Generate realistic monster actions based on CR, abilities, and the current combat situation. Keep responses brief and action-oriented.`,
      userMessage: `Monster: ${monsterName}\nSituation: ${situation}\n\nWhat does this monster do?`,
    };

    return this.generateDMResponse(context);
  }

  async evaluatePlayerAction(
    action: string,
    rules: string,
    diceResult: number,
  ): Promise<AIResponse> {
    const context: PromptContext = {
      systemMessage: `You are a Dungeon Master evaluating player actions in D&D 5e. Be fair, creative, and consistent with the rules provided. Describe the outcome and any consequences.`,
      userMessage: `Player Action: ${action}\nRules to Apply: ${rules}\nDice Result: ${diceResult}\n\nWhat is the outcome?`,
    };

    return this.generateDMResponse(context);
  }

  getCircuitBreakerStatus() {
    return {
      groq: this.groqBreaker.getState(),
      ollama: this.ollamaBreaker.getState(),
    };
  }

  resetCircuitBreakers(): void {
    this.groqBreaker.reset();
    this.ollamaBreaker.reset();
    console.log('[AI Service] Circuit breakers reset');
  }

  async healthCheck(): Promise<{
    groq: { ok: boolean; latencyMs?: number; error?: string };
    ollama: { ok: boolean; latencyMs?: number; error?: string };
  }> {
    const groqStart = Date.now();
    const ollamaStart = Date.now();

    const groqPromise = this.pingGroq()
      .then(() => ({ ok: true, latencyMs: Date.now() - groqStart }))
      .catch((err: any) => ({ ok: false, error: err?.message || 'Groq failed' }));

    const ollamaPromise = this.pingOllama()
      .then(() => ({ ok: true, latencyMs: Date.now() - ollamaStart }))
      .catch((err: any) => ({ ok: false, error: err?.message || 'Ollama failed' }));

    const [groq, ollama] = await Promise.all([groqPromise, ollamaPromise]);

    return { groq, ollama };
  }

  private async pingGroq(): Promise<void> {
    if (!this.groqApiKey || this.groqApiKey === 'your-groq-api-key') {
      throw new Error('GROQ_API_KEY not configured');
    }
    await this.withRetry(
      () =>
        axios.post(
          this.groqApiUrl,
          {
            model: this.groqModel,
            messages: [{ role: 'user', content: 'Responda apenas com OK.' }],
            temperature: 0,
            max_tokens: 8,
          },
          {
            headers: {
              Authorization: `Bearer ${this.groqApiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 15000,
          },
        ),
      1,
      500,
    );
  }

  private async pingOllama(): Promise<void> {
    await this.withRetry(
      () =>
        axios.post(
          `${this.ollamaUrl}/api/generate`,
          {
            model: this.ollamaModel,
            prompt: 'Responda apenas com OK.',
            stream: false,
            options: { num_predict: 8 },
          },
          { timeout: 20000 },
        ),
      1,
      500,
    );
  }
}

export const aiService = new AIService();
