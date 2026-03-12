# MestrIA Backend - Documentacao Completa

## Status Atual

**Tudo implementado e pronto para desenvolvimento!**

### O que foi criado:

1. **Prisma ORM** ✓
   - Schema com 17 tabelas
   - Migrações automáticas
   - Seed com dados fictícios

2. **Arquitetura Limpa** ✓
   - Domain Layer: Entidades e Repositórios
   - Application Layer: Use Cases e DTOs
   - Infrastructure Layer: Prisma e Serviços
   - Presentation Layer: Controllers e Routes

3. **Sistema de IA** ✓
   - Circuit Breaker Pattern
   - Integração Groq (API Cloud)
   - Integração Ollama (Fallback Local)
   - Context Manager para memória da IA
   - 3 endpoints HTTP funcionais

4. **Docker** ✓
   - PostgreSQL 16
   - API Node.js
   - Ollama para IA local

5. **Documentação Completa** ✓
   - ARCHITECTURE.md - Explicação da arquitetura
   - AI_SYSTEM.md - Documentação de IA
   - SEEDS.md - Dados de teste
   - HOW_TO_ADD_FEATURES.md - Como adicionar features
   - QUICK_START.md - Guia rápido

## Arquivos Criados

### Core Backend
```
src/
├── main.ts                      # Entry point
├── domain/
│   ├── entities/User.ts        # User entity
│   ├── repositories/           # Repository interfaces
│   └── services/               # Domain services (Context Manager)
├── application/
│   ├── dto/                    # Data transfer objects
│   └── use-cases/              # Use cases (includes AI)
├── infrastructure/
│   ├── http/server.ts          # Express server
│   ├── prisma/                 # Prisma client e repositories
│   └── ai/                     # Circle Breaker e AI Service
├── presentation/
│   ├── controllers/            # HTTP controllers
│   ├── routes/                 # Route definitions
│   └── middlewares/            # Express middlewares
└── shared/
    ├── utils/                  # Utility functions
    └── errors/                 # Custom error classes
```

### Database
```
prisma/
├── schema.prisma              # Database schema
└── seed.ts                    # Test data
```

### Configuration
```
.env.example                  # Environment variables template
.env.local                    # Local development config
tsconfig.json                # TypeScript config
package.json                 # Updated with new scripts
docker-compose.yml          # Container orchestration
Dockerfile                  # API container image
```

### Documentation
```
ARCHITECTURE.md              # Clean architecture explanation
AI_SYSTEM.md                # AI and circuit breaker docs
SEEDS.md                    # Database seeding guide
QUICK_START.md              # Fast setup guide
HOW_TO_ADD_FEATURES.md      # Feature development guide
DEPLOYMENT_CHECKLIST.md     # Setup completion checklist
README.md                   # Original project README
```

### Testing & Tools
```
postman_collection.json     # Postman/Insomnia requests
setup.sh                    # One-click setup script
test-api.sh                 # API testing script
```

## Comands Principais

### Setup (Escolha uma opcao)

**Opcao 1: Automated Setup (Recomendado)**
```bash
./setup.sh
```

**Opcao 2: Manual Setup**
```bash
npm install
npm run prisma:migrate
npm run seed
npm run dev:watch
```

### Desenvolvimento

```bash
npm run dev:watch              # Servidor com hot reload
npm run build                  # Build para producao
npm run prisma:studio          # Interface visual do banco
npm run prisma:migrate         # Executar migrations
npm run seed                   # Repovoar banco com dados
```

### Testing

```bash
./test-api.sh                  # Testar API via shell
curl http://localhost:3000/health  # Health check
```

## Endpoints Disponiveis

### Health
```
GET /health
```

### AI (Novo!)
```
POST /api/ai/generate
GET /api/ai/circuit-breaker/status
POST /api/ai/circuit-breaker/reset
```

### Preparados (rotas vazias - implementar)
```
POST /api/users
GET /api/users/:id
POST /api/campaigns
GET /api/campaigns/:id
POST /api/characters
GET /api/characters/:id
```

## Sistema de IA Explicado

### Fluxo

```
Requisicao
    |
    v
Tentar Groq (Circuit Breaker)
    |
    +-- Sucesso? --> Retornar
    |
    +-- Falha? --> Abrir CB
         |
         v
    Tentar Ollama (Fallback Local)
         |
         +-- Sucesso? --> Retornar
         |
         +-- Falha? --> Erro total
```

### States do Circuit Breaker

1. **CLOSED** - Normal, acumula erros
2. **OPEN** - Muitos erros, rejeita requisicoes
3. **HALF-OPEN** - Tentando recuperar

### Configuracao

```env
GROQ_API_KEY=sua-chave         # (Opcional) API key do Groq
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

### Usar

```bash
# Request
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "uuid",
    "message": "Texto do user"
  }'

# Response (Groq)
{
  "content": "Response text...",
  "model": "mixtral-8x7b-32768",
  "source": "groq",
  "tokensUsed": 45,
  "timestamp": "2024-03-12T15:30:00Z"
}
```

## Dados de Teste

Apos `npm run seed`:

**Usuarios:**
- alice@example.com / password123
- bob@example.com / password123
- carol@example.com / password123
- david@example.com / password123

**Campanha:**
- Title: "The Lost Mines of Phandalin"
- Code: CAMP1234
- DM: AI

**Personagens:**
- Thordak (Dwarf Fighter)
- Liriel (Elf Wizard)
- Aramina (Human Cleric)

**Items:**
- Longsword, Plate Armor, Health Potion, etc

**Spells:**
- Fireball, Magic Missile, Healing Word, Lightning Bolt

**Monsters:**
- Goblin, Orc, Dragon Wyrmling, Skeleton

## Estrutura de Features (Padrão)

Para adicionar nova feature (ex: Campaigns CRUD):

```
1. Entity             → domain/entities/Campaign.ts
2. Repository Iface  → domain/repositories/ICampaignRepository.ts
3. Repository Impl   → infrastructure/prisma/repositories/CampaignRepository.ts
4. DTOs              → application/dto/CampaignDTO.ts
5. Use Cases         → application/use-cases/CampaignUseCases.ts
6. Controller        → presentation/controllers/CampaignController.ts
7. Routes           → presentation/routes/campaignRoutes.ts
8. Register Routes  → infrastructure/http/server.ts
```

Ver: HOW_TO_ADD_FEATURES.md para exemplo completo

## Troubleshooting

### "Circuit breaker is OPEN"
```bash
curl -X POST http://localhost:3000/api/ai/circuit-breaker/reset
```

### "Both Groq and Ollama failed"
1. Verificar Groq API key
2. Verificar Ollama: `curl http://localhost:11434/api/tags`
3. Iniciar Ollama: `docker-compose up -d ollama`

### "PostgreSQL connection refused"
```bash
docker-compose up -d postgres
sleep 10
npm run prisma:migrate
```

### "Relation does not exist"
```bash
npm run prisma:migrate
```

## Documentacoes por Topico

| Documento | Tema |
|-----------|------|
| ARCHITECTURE.md | Explicacao da arquitetura limpa |
| AI_SYSTEM.md | Detalha IA e Circuit Breaker |
| SEEDS.md | Como usar dados de teste |
| QUICK_START.md | Setup rapido |
| HOW_TO_ADD_FEATURES.md | Padroes para features |
| DEPLOYMENT_CHECKLIST.md | Checklist do projeto |

## Proximas Features

Priority Alta:
- [ ] Autenticacao JWT
- [ ] Campanhas CRUD
- [ ] Personagens CRUD

Priority Media:
- [ ] WebSocket chat em tempo real
- [ ] Sistema de combate
- [ ] Dice rolling
- [ ] NPC interactions

Priority Baixa:
- [ ] Streaming responses
- [ ] Caching de respostas
- [ ] Analytics
- [ ] A/B testing de modelos

## Quick Links

- API: http://localhost:3000
- Prisma Studio: http://localhost:5555
- PostgreSQL: localhost:5432
- Ollama: http://localhost:11434

## Variaveis de Ambiente

```env
# Database
DATABASE_URL="postgresql://postgres:tdvlkw1!@localhost:5432/mestria"

# Server
PORT=3000
NODE_ENV=development

# AI
GROQ_API_KEY=your-key
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# WebSocket
SOCKET_IO_CORS_ORIGIN=http://localhost:5173
```

## Stack Tecnologico

- **Runtime:** Node.js 18+
- **Linguagem:** TypeScript
- **Framework:** Express.js
- **Banco:** PostgreSQL 16 + Prisma ORM
- **Tempo Real:** Socket.io
- **IA:** Groq API + Ollama Local
- **Containerizacao:** Docker + Docker Compose
- **Code Quality:** ESLint, Prettier

## Performance

- **Groq Response Time:** ~100-500ms
- **Ollama Response Time:** ~2-30s (depende hardware)
- **Circuit Breaker Timeout:** 60s (Groq), 30s (Ollama)
- **Failure Threshold:** 3 erros antes de OPEN

## Security Notes

- Senhas sao hashed com bcrypt
- .env.local nao deve ser commitado
- Implementar JWT para autenticacao (TODO)
- Validar inputs em todos endpoints (TODO)
- Rate limiting (TODO)

## Debugging

Enable verbose logs:
```env
NODE_ENV=development
```

Logs aparecerao no console:
```
[AI Service] Generating DM response...
[Groq] Sending request...
[Circuit Breaker] State changed to CLOSED
```

## Contribuindo

1. Ler ARCHITECTURE.md para entender structure
2. Seguir padroes em HOW_TO_ADD_FEATURES.md
3. Usar Prisma Studio para visualizar dados
4. Testar com scripts em test-api.sh

---

**Backend esta 100% pronto para desenvolvimento de features!**

Comece com: `npm run dev:watch` e `npm run prisma:studio`
