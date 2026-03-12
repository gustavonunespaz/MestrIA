# Quick Start - MestrIA Backend

## Setup Inicial (5 minutos)

### 1. Instalar Dependencias

```bash
cd /home/gustavonunes/MestrIA
npm install
```

### 2. Configurar Ambiente

```bash
# Gerar arquivo .env com defaults
cp .env.example .env.local

# Editar .env.local se necessario
# Importante: GROQ_API_KEY precisa ser sua chave real
```

### 3. Iniciar Banco de Dados e Populate

```bash
# Com Docker (Recomendado - tudo automatico)
docker-compose up -d

# Aguardar ~10 segundos
sleep 10

# Executar migrations
npm run prisma:migrate

# Executar seeds
npm run seed
```

Ou **sem Docker**:
```bash
# Ter PostgreSQL rodando localmente em localhost:5432
npm run prisma:migrate
npm run seed
```

### 4. Iniciar Servidor

```bash
npm run dev:watch
```

Saida esperada:
```
Server is running on http://localhost:3000
```

## Testar a API

### 1. Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-03-12T15:30:00Z"
}
```

### 2. Gerar Resposta de IA (Groq → Ollama)

```bash
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "camp-id-aqui",
    "message": "Thordak entra em uma taverna escura e procura por pistas"
  }'
```

**Nota:** Substitua `campaign-id-aqui` com um ID real do banco.

Para pegar um ID válido:
```bash
npm run prisma:studio
# Abrir navegador em localhost:5555 e copiar um ID de campaign
```

Response de sucesso (Groq):
```json
{
  "content": "Thordak pushes open the heavy wooden door...",
  "model": "mixtral-8x7b-32768",
  "source": "groq",
  "tokensUsed": 45,
  "timestamp": "2024-03-12T15:30:00Z"
}
```

Ou (Ollama - se Groq falhar):
```json
{
  "content": "The tavern is dimly lit...",
  "model": "llama2",
  "source": "ollama",
  "timestamp": "2024-03-12T15:30:00Z"
}
```

### 3. Verificar Status do Circuit Breaker

```bash
curl http://localhost:3000/api/ai/circuit-breaker/status
```

Response:
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

Estados possiveis:
- `closed` - Funcionando normal
- `open` - Servico falhando, rejeitando requisicoes
- `half-open` - Tentando recuperar

### 4. Resetar Circuit Breakers (se necessario)

```bash
curl -X POST http://localhost:3000/api/ai/circuit-breaker/reset
```

## Dados de Teste Disponiveis

Apos rodar `npm run seed`, o banco vem com:

### Usuarios
```
alice@example.com / password123
bob@example.com / password123
carol@example.com / password123
david@example.com / password123
```

### Campanha
```
ID: [copiar do Prisma Studio]
Title: The Lost Mines of Phandalin
Invite Code: CAMP1234
DM Type: AI
```

### Personagens
```
1. Thordak Ironforge (Dwarf Fighter)
2. Liriel Moonwhisper (Elf Wizard)
3. Aramina Goldensong (Human Cleric)
```

### Spells, Items, Monsters
- 4 spell templates
- 5 item templates
- 4 monster templates
- 2 monster instances

## Workflow de Desenvolvimento

### 1. Verificar dados com Prisma Studio

```bash
npm run prisma:studio
```

Isso abre `http://localhost:5555` com interface visual.

### 2. Testar IA com curl

```bash
# Pegar campaign ID do studio, depois testar
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "[CAMPAIGN_ID]",
    "message": "Os jogadores entram em combate contra um goblin"
  }'
```

### 3. Monitorar logs

Terminal 1:
```bash
npm run dev:watch
```

Veras logs como:
```
[AI Service] Generating DM response...
[Groq] Sending request...
[Groq] Response received successfully
```

### 4. Se Groq falhar, vai para Ollama

Certifique-se de que Ollama esta rodando:
```bash
docker ps | grep ollama

# Se nao esta rodando:
docker-compose up -d ollama
```

Baixar um modelo:
```bash
docker exec mestria-ollama ollama pull llama2
```

## Estrutura de Arquivos Criados

```
src/
├── infrastructure/ai/
│   ├── CircuitBreaker.ts       [Padrão de recuperação de falhas]
│   └── AIService.ts             [Integração com Groq + Ollama]
├── domain/services/
│   └── ContextManagerService.ts [Gerenciar contexto da IA]
├── application/use-cases/
│   └── AIUseCases.ts            [Orquestração de IA]
├── presentation/
│   ├── controllers/
│   │   └── AIController.ts      [Endpoints HTTP]
│   └── routes/
│       └── aiRoutes.ts          [Rotas da IA]

prisma/
└── seed.ts                      [Dados fictícios]

docs/
├── AI_SYSTEM.md                 [Documentação de IA]
├── SEEDS.md                     [Documentação de seeds]
└── ARCHITECTURE.md              [Arquitetura]
```

## Troubleshooting

### Erro: "Circuit breaker is OPEN"

Significa que Groq ou Ollama falharam múltiplas vezes.

Solucao:
```bash
# Reset os circuit breakers
curl -X POST http://localhost:3000/api/ai/circuit-breaker/reset

# Ou aguarde 1 minuto para auto-recovery
```

### Erro: "Both Groq and Ollama failed"

Verificacoes:

1. **Groq (se tiver API key):**
   ```bash
   curl -X POST https://api.groq.com/openai/v1/chat/completions \
     -H "Authorization: Bearer $GROQ_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"mixtral-8x7b-32768","messages":[{"role":"user","content":"test"}]}'
   ```

2. **Ollama:**
   ```bash
   curl http://localhost:11434/api/tags
   ```

   Se der erro, inicie:
   ```bash
   docker-compose up -d ollama
   docker exec mestria-ollama ollama pull llama2
   ```

### Erro: "PostgreSQL connection refused"

Certifique-se de que o banco esta rodando:
```bash
# Com Docker
docker ps | grep postgres

# Se nao esta, inicie
docker-compose up -d postgres
```

### Erro: "Relation does not exist"

Precisa executar migrations:
```bash
npm run prisma:migrate
```

## Proximas Features Para Implementar

- [ ] Autenticacao JWT
- [ ] Endpoints CRUD de Campanhas
- [ ] Endpoints CRUD de Personagens
- [ ] WebSocket para chat em tempo real
- [ ] Sistema de combate/turn order
- [ ] Dice rolling
- [ ] NPC interaction
- [ ] Spell learning/management
- [ ] Inventory management
- [ ] Experience/leveling system

## Recursos Uteis

- Prisma Studio: `npm run prisma:studio`
- Ver logs do Docker: `docker logs mestria-api`
- Resetar banco: `npm run prisma:migrate reset`
- Re-popular com seeds: `npm run seed`

## Documentacao

- [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitetura limpa explicada
- [AI_SYSTEM.md](AI_SYSTEM.md) - Sistema de IA e Circuit Breaker
- [SEEDS.md](SEEDS.md) - Dados de teste e seeds
- [HOW_TO_ADD_FEATURES.md](HOW_TO_ADD_FEATURES.md) - Como adicionar features

## Links Importantes

- API: http://localhost:3000
- Health: http://localhost:3000/health
- Prisma Studio: http://localhost:5555 (apos `npm run prisma:studio`)
- Ollama: http://localhost:11434 (se rodando)

## Atalhos Uteis

```bash
# Desenvolvimento
npm run dev:watch      # Inicia servidor com hot reload
npm run build         # Compila para dist/

# Banco de Dados
npm run prisma:studio # Abre interface visual
npm run seed          # Popula com dados de teste
npm run prisma:migrate reset  # Limpa tudo e recria zero

# AI
npm run ai:test       # (Futuro) Testa sistema de IA
```

---

Pronto para desenvolvimento! Comece com `npm run dev:watch` e `npm run prisma:studio` em abas diferentes.
