# MestrIA Backend - Índice de Documentação

Bem-vindo ao backend do **MestrIA** - Uma plataforma de RPG com IA DM alimentada por Groq e Ollama!

Este é seu ponto de partida para entender, desenvolver e deployar o projeto.


## 📋 Quick Navigation

### 🚀 Começar (5 minutos)
- **[QUICK_START.md](QUICK_START.md)** - Setup automático em 5 minutos
  - Execute `./setup.sh`
  - Execute `npm run dev:watch`
  - Acesse http://localhost:3000

### 📖 Entender a Arquitetura
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Clean Architecture explicada
  - Domain, Application, Infrastructure, Presentation
  - Diagramas e exemplos de fluxo
  - Como cada camada funciona

- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Estrutura de pastas
  - Árvore de diretórios completa
  - Descrição de cada arquivo
  - Linhas de código por módulo

### 🤖 Sistema de IA
- **[AI_SYSTEM.md](AI_SYSTEM.md)** - Circuit Breaker & Integração
  - Como funciona o Circuit Breaker
  - Groq API (primary) vs Ollama (fallback)
  - Estados e transições
  - Exemplos de uso

### 💾 Banco de Dados
- **[SEEDS.md](SEEDS.md)** - Dados de teste
  - Estrutura do seed.ts
  - Dados inclusos
  - Como popular e resetar

### 🔧 Desenvolvimento
- **[HOW_TO_ADD_FEATURES.md](HOW_TO_ADD_FEATURES.md)** - Padrão de desenvolvimento
  - Step-by-step para novo feature
  - Exemplos práticos
  - Estrutura de pastas por feature

### 🚢 Deploy & Operações
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Checklist de deploy
  - Pre-deployment checks
  - Deploy steps
  - Post-deployment verification

- **[BACKEND.md](BACKEND.md)** - Backend setup guide
  - Instalação passo a passo
  - Configuração de ambiente
  - Troubleshooting

### 📚 Documentação Completa
- **[COMPLETE_GUIDE.md](COMPLETE_GUIDE.md)** - Guia definitivo (200+ linhas)
  - Overview completo
  - Todos os endpoints
  - Exemplos de requisições
  - Debugging & monitoring

### 📊 Status & Métricas
- **[FINAL_STATUS.md](FINAL_STATUS.md)** - Status final
  - Checklist de entrega
  - Métricas do projeto
  - Próximos passos

- **[FILES_CREATED.md](FILES_CREATED.md)** - Lista de arquivos criados
  - Cada arquivo criado
  - Propósito do arquivo
  - Localização

---

## 🗂️ Estrutura de Pastas

```
MestrIA/
├── src/                    # Código fonte (TypeScript)
│   ├── domain/            # Camada de domínio
│   ├── application/       # Camada de aplicação
│   ├── infrastructure/    # Camada de infraestrutura
│   ├── presentation/      # Camada de apresentação
│   ├── shared/           # Utilities compartilhadas
│   └── main.ts           # Entry point
│
├── prisma/               # ORM Prisma
│   ├── schema.prisma     # Database schema
│   ├── seed.ts          # Dados de teste
│   └── migrations/      # Migrações automáticas
│
├── [Documentação - 9 arquivos .md]
├── [Scripts - 3 arquivos executáveis]
├── docker-compose.yml   # Orquestração de containers
└── Dockerfile          # Imagem da API
```


## 🎯 Roteiros por Tipo de Usuário

### Para Desenvolvedores Novos
1. Leia **[QUICK_START.md](QUICK_START.md)** (setup)
2. Leia **[ARCHITECTURE.md](ARCHITECTURE.md)** (entender padrão)
3. Abra [src/domain/entities/User.ts](src/domain/entities/User.ts) (exemplo)
4. Siga [HOW_TO_ADD_FEATURES.md](HOW_TO_ADD_FEATURES.md) (implementar novo feature)

### Para DevOps/SRE
1. Leia **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)**
2. Configure Docker Compose
3. Monitorar com comandos em **[COMPLETE_GUIDE.md](COMPLETE_GUIDE.md)**

### Para QA/Testing
1. Execute **./setup.sh** (setup)
2. Execute **./test-api.sh** (menu interativo)
3. Use **postman_collection.json** (importar em Postman/Insomnia)

### Para Project Managers
1. Leia **[FINAL_STATUS.md](FINAL_STATUS.md)** (status geral)
2. Veja checklist de entrega
3. Verifique métricas e próximos passos


## 🛠️ Scripts Úteis

### Setup Automático
```bash
chmod +x setup.sh
./setup.sh          # Instala + migra + seeds
```

### Desenvolvimento
```bash
npm run dev:watch   # Hot reload
npm run build       # Compile TypeScript
```

### Database
```bash
npm run prisma:migrate    # Create migrations
npm run seed              # Populate test data
npm run prisma:studio     # Visual editor
```

### Testing
```bash
./test-api.sh             # Interactive tests
curl http://localhost:3000/health  # Health check
```


## 📋 Endpoints Disponíveis

### Users
```
POST   /api/users           # Criar usuário
GET    /api/users/:id       # Get usuário
PUT    /api/users/:id       # Update usuário
DELETE /api/users/:id       # Delete usuário
```

### AI
```
POST   /api/ai/generate              # Gerar resposta DM
GET    /api/ai/circuit-breaker/status # Ver status
POST   /api/ai/circuit-breaker/reset  # Reset manual
```

Veja [COMPLETE_GUIDE.md](COMPLETE_GUIDE.md) para exemplos completos.


## 🔑 Arquivos Chave

| Arquivo | Propósito |
|---------|-----------|
| [src/main.ts](src/main.ts) | Entry point da aplicação |
| [src/domain/entities/User.ts](src/domain/entities/User.ts) | Exemplo de entity |
| [src/presentation/controllers/UserController.ts](src/presentation/controllers/UserController.ts) | Exemplo de controller |
| [src/infrastructure/ai/CircuitBreaker.ts](src/infrastructure/ai/CircuitBreaker.ts) | Circuit Breaker pattern |
| [prisma/schema.prisma](prisma/schema.prisma) | Schema do banco (17 tabelas) |
| [prisma/seed.ts](prisma/seed.ts) | Dados de teste |


## ⚙️ Configuração

### .env.local (Development)
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/mestria
GROQ_API_KEY=seu_groq_key
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

### Docker Services
- **PostgreSQL** - Primary database
- **API** - Node.js server (port 3000)
- **Ollama** - Local LLM (port 11434)


## 🐛 Troubleshooting

### Erro: Port já em uso
```bash
lsof -i :3000 && kill -9 <PID>
```

### Erro: PostgreSQL connection refused
```bash
docker-compose up -d postgres
```

### Erro: Circuit breaker está OPEN
```bash
curl -X POST http://localhost:3000/api/ai/circuit-breaker/reset
```

Veja [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) para mais issues.


## 📈 Próximos Passos

### Curto Prazo (Next Sprint)
- [ ] JWT Authentication
- [ ] Campaign CRUD
- [ ] Character CRUD
- [ ] WebSocket real-time chat

### Médio Prazo
- [ ] Combat system
- [ ] Dice rolling
- [ ] XP & leveling

### Longo Prazo
- [ ] NPC interactions
- [ ] Quest system
- [ ] Procedural generation

Veja [FINAL_STATUS.md](FINAL_STATUS.md) para detalhes.


## 📊 Status Geral

✅ **Pronto para Desenvolvimento**

- TypeScript: 0 erros
- Dependencies: 227 pacotes
- Documentação: 9 arquivos
- Scripts: 3 executáveis
- Endpoints: 7 implementados
- Código: ~2500 linhas


## 🤝 Como Contribuir

1. Escolha um feature em "Próximos Passos"
2. Crie a estrutura seguindo [HOW_TO_ADD_FEATURES.md](HOW_TO_ADD_FEATURES.md)
3. Siga o padrão Clean Architecture de [ARCHITECTURE.md](ARCHITECTURE.md)
4. Teste com [test-api.sh](test-api.sh)
5. Update docs se necessário


## 📞 Referência Rápida

| Necessidade | Arquivo |
|------------|---------|
| Setup rápido | [QUICK_START.md](QUICK_START.md) |
| Entender código | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Adicionar feature | [HOW_TO_ADD_FEATURES.md](HOW_TO_ADD_FEATURES.md) |
| Deployar | [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) |
| Testar API | [COMPLETE_GUIDE.md](COMPLETE_GUIDE.md) |
| Estrutura projeto | [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) |
| IA integration | [AI_SYSTEM.md](AI_SYSTEM.md) |
| Database | [SEEDS.md](SEEDS.md) |
| Status geral | [FINAL_STATUS.md](FINAL_STATUS.md) |


## 🚀 Começar Agora

```bash
cd /home/gustavonunes/MestrIA
./setup.sh          # Automated setup
npm run dev:watch   # Start development
```

Acesse em: http://localhost:3000

---

**Desenvolvido com ❤️ em Clean Architecture, TypeScript, e Princípios SOLID**

*Última atualização: Dezembro 2024*
