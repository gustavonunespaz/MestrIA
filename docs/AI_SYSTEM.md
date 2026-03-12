# Sistema de IA - MestrIA

## Overview

O sistema de IA do MestrIA utiliza um padrão de **Circuit Breaker** com fallback automático para garantir disponibilidade e recuperação de falhas.

## Arquitetura

### Circuit Breaker Pattern

O Circuit Breaker funciona em 3 estados:

1. **CLOSED** (Normal)
   - Requisições são processadas normalmente
   - Acumula erros

2. **OPEN** (Falhaço)
   - Rejeita requisições imediatamente
   - Aguarda timeout

3. **HALF-OPEN** (Recuperação)
   - Permite algumas requisições para testar se o serviço se recuperou
   - Se suceder, volta para CLOSED
   - Se falhar, volta para OPEN

### Fluxo de Requisição

```
Requisicao de IA
    |
    v
Tentar Groq (Circuit Breaker #1)
    |
    |--- Sucesso? ---> Retornar resposta (Groq)
    |
    |--- Falha? ---> Abrir? Sim -> OPEN
    |
    v
Tentar Ollama (Circuit Breaker #2)
    |
    |--- Sucesso? ---> Retornar resposta (Ollama)
    |
    |--- Falha? ---> Erro completo
```

## Configuracao

### Variaveis de Ambiente

```env
# Groq Configuration
GROQ_API_KEY=sua-chave-aqui
# Nota: Nao precisa de URL, usamos https://api.groq.com/openai/v1/chat/completions

# Ollama Configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# Debug
NODE_ENV=development
```

### Docker Setup (Ollama)

```bash
# Ollama ja vem no docker-compose.yml
docker-compose up -d ollama

# Verificar se esta saudavel
curl http://localhost:11434/api/tags

# Baixar um modelo
docker exec mestria-ollama ollama pull llama2
```

## Endpoints da API

### 1. Gerar Resposta de IA

**Endpoint:** `POST /api/ai/generate`

**Request:**
```json
{
  "campaignId": "uuid-da-campanha",
  "characterId": "uuid-do-personagem", // Opcional
  "message": "Thordak tenta derrotar o goblin",
  "type": "narrative" // ou "combat-action", "evaluate-action"
}
```

**Response:**
```json
{
  "content": "Thordak balanca sua espada com forca...",
  "model": "mixtral-8x7b-32768",
  "source": "groq",
  "tokensUsed": 45,
  "timestamp": "2024-03-12T15:30:00Z"
}
```

### 2. Status do Circuit Breaker

**Endpoint:** `GET /api/ai/circuit-breaker/status`

**Response:**
```json
{
  "groq": {
    "state": "closed",
    "failureCount": 0,
    "successCount": 0
  },
  "ollama": {
    "state": "closed",
    "failureCount": 0,
    "successCount": 0
  }
}
```

### 3. Reset Circuit Breakers

**Endpoint:** `POST /api/ai/circuit-breaker/reset`

**Response:**
```json
{
  "message": "Circuit breakers reset successfully"
}
```

## Contexto da IA

O sistema envia contexto automatico para a IA:

### System Prompt
- Nome e descricao da campanha
- Sistema de jogo (D&D 5e, etc)
- Numero de jogadores
- Instrucoes de comportamento do DM

### Campaign Context
```json
{
  "campaignTitle": "The Lost Mines of Phandalin",
  "systemBase": "D&D 5e",
  "dmType": "AI",
  "description": "A classic adventure...",
  "playersCount": 3
}
```

### Character Context
```json
{
  "characterName": "Thordak Ironforge",
  "level": 5,
  "race": "Dwarf",
  "class": "Fighter",
  "hpCurrent": 45,
  "hpMax": 45,
  "spells": ["Magic Missile"],
  "items": ["Longsword", "Health Potion"],
  "isAlive": true
}
```

### Message History
- Ultimas 5 mensagens do chat
- Para manter coerencia narrativa

## Uso Na Pratica

### 1. Gerar Narrativa de Cena

```bash
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "camp-id",
    "message": "Thordak entra na taverna"
  }'
```

### 2. Gerar Acao de Monstro

```bash
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "camp-id",
    "message": "O goblin ataca Thordak",
    "type": "combat-action"
  }'
```

### 3. Avaliar Acao do Jogador

```bash
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "camp-id",
    "characterId": "char-id",
    "message": "Thordak tenta saltar sobre um abismo com DC 15"
  }'
```

## Modelos Disponiveis

### Groq (Principal)

**Modelo Padrao:** `mixtral-8x7b-32768`
- Temperatura: 0.8
- Max tokens: 1024
- Latencia: ~100ms
- Custo: Gratuito (com limite)

Outros modelos disponiveis:
- `llama2-70b-4096`
- `gemma-7b-it`

### Ollama (Fallback Local)

**Modelos Populares:**
```bash
ollama pull llama2
ollama pull neural-chat
ollama pull mistral
ollama pull dolphin-mixtral
```

**Configurar modelo diferente:**
```env
OLLAMA_MODEL=neural-chat
```

## Tratamento de Erros

### Ambos os servicos falhando

```json
{
  "error": "Both Groq and Ollama failed. Unable to generate AI response."
}
```

Se isso acontecer:

1. Verificar se Groq API key esta correta
2. Verificar se Ollama esta rodando: `curl http://localhost:11434/api/tags`
3. Verificar logs: `docker logs mestria-ollama`
4. Resetar circuit breakers: `POST /api/ai/circuit-breaker/reset`

### Circuit Breaker Aberto

```json
{
  "error": "Circuit breaker is OPEN. Service unavailable."
}
```

Aguardar ~1 minuto ou resetar manualmente.

## Performance

### Groq (com sucesso)
- Tempo resposta: 100-500ms
- Tokens: Depende do modelo

### Ollama (fallback)
- Tempo resposta: 2-30s (depende do hardware)
- Sem limite de tokens
- Totalmente local/gratuito

## Logging

O sistema registra tudo:

```
[AI Service] Generating DM response...
[Groq] Sending request...
[Groq] Response received successfully
[Circuit Breaker] State changed to CLOSED
```

Se Groq falhar:
```
[Groq Error] 429 Too Many Requests
[AI Service] Groq failed, falling back to Ollama...
[Ollama] Sending request...
[Ollama] Response received successfully
```

## Proximos Passos

- [ ] Memory Management (context window optimization)
- [ ] Streaming responses para respostas longas
- [ ] Temperature/Top-P customizacao por tipo de requisicao
- [ ] Caching de respostas similares
- [ ] Analytics de uso
- [ ] A/B testing de modelos
- [ ] WebSocket support para respostas em tempo real

## Bugs Conhecidos / TODO

- [ ] Timeout muito agressivo no Groq
- [ ] Ollama nao retorna token count
- [ ] Caching de contexto para performance
- [ ] Rate limiting por usuario
