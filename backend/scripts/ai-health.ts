import 'dotenv/config';
import { aiService } from '../src/infrastructure/ai/AIService';

async function run(): Promise<void> {
  console.log('[AI Health] Iniciando verificação...');

  const status = await aiService.healthCheck();

  const groqLine = status.groq.ok
    ? `Groq: OK (${status.groq.latencyMs}ms)`
    : `Groq: FALHOU (${status.groq.error})`;

  const ollamaLine = status.ollama.ok
    ? `Ollama: OK (${status.ollama.latencyMs}ms)`
    : `Ollama: FALHOU (${status.ollama.error})`;

  console.log(groqLine);
  console.log(ollamaLine);

  if (!status.groq.ok || !status.ollama.ok) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error('[AI Health] Erro inesperado:', error);
  process.exit(1);
});
