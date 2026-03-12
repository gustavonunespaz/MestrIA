# SETUP COMPLETO - MestrIA Backend

## O que foi configurado:

### 1. **Prisma ORM** 
   - Schema completo baseado no seu SQL (`prisma/schema.prisma`)
   - Todas as 17 tabelas mapeadas com relacionamentos
   - Enums criados (`DmType`, `SenderRole`, `SessionStatus`)
   - Cliente Prisma configurado em `src/infrastructure/prisma/client.ts`

### 2. **Arquitetura Limpa** 
   ```
   src/
   ├── domain/              # Entidades, Interfaces de Repositórios
   ├── application/         # Use Cases, DTOs
   ├── infrastructure/      # Prisma, Express, AI
   ├── presentation/        # Controllers, Routes, Middlewares
   └── shared/             # Erros, Utilidades
   ```

### 3. **Docker Setup**
   - `Dockerfile` com multi-stage build (otimizado)
   - `docker-compose.yml` com 3 serviços:
     - PostgreSQL 16
     - API Node.js
     - Ollama (IA local)
   - Health checks e networking configurados

### 4. **Configuração TypeScript**
   - `tsconfig.json` com path aliases (`@domain/*`, etc)
   - Strict mode ativado
   - Source maps e declaration files

### 5. **Dependências**
   - Express 4.18.2 (servidor HTTP)
   - Prisma 5.7.1 (ORM)
   - Socket.io 4.7.2 (WebSockets)
   - TypeScript, bcrypt, axios
   - Ferramentas dev: ts-node, ESLint, Prettier

### 6. **Scripts Úteis**
   ```bash
   npm run dev:watch           # Desenvolvimento com hot reload
   npm run build              # Build para produção
   npm start                  # Rodar compilado
   npm run prisma:migrate     # Executar migrations
   npm run prisma:studio      # Acessar Prisma Studio
   ```

### 7. **Exemplo Implementado**
   - Entidade `User` com validações
   - Repositório com interface segregada
   - Use Cases de criação e busca
   - Controller com tratamento de erros
   - Rotas preparadas
   - DTOs para transferência de dados

---

## PROXIMOS PASSOS (Quick Start):

### 1. Instale as dependências:
```bash
cd /home/gustavonunes/MestrIA
npm install
```

### 2. Configure o banco (escolha uma opção):

#### Opção A: Docker (Recomendado)
```bash
docker-compose up -d        # Inicia PostgreSQL + API + Ollama
npm run prisma:migrate      # Executa migrations
npm run dev:watch           # Inicia servidor
```

#### Opção B: PostgreSQL Local
```bash
# Configure DATABASE_URL em .env.local
npm run prisma:migrate      # Executa migrations
npm run dev:watch           # Inicia servidor
```

### 3. Teste a API:
```bash
# Terminal 1: Inicie o servidor
npm run dev:watch

# Terminal 2: Teste um endpoint
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"João","email":"joao@test.com","password":"123456"}'
```

---

## DOCUMENTACAO CRIADA:

- **`ARCHITECTURE.md`** - Explicação detalhada da arquitetura limpa
- **`BACKEND.md`** - Guia de setup e uso (este arquivo original)
- **`HOW_TO_ADD_FEATURES.md`** - Step-by-step para adicionar novas features
- **`.env.example`** - Template de variáveis de ambiente
- **`.env.local`** - Configurações de desenvolvimento (nao commitar)

---

## 🏗️ ESTRUTURA DE ADICIONAR FEATURES:

Para adicionar uma nova feature (ex: Campaigns):

1. Criar entidade em `domain/entities/Campaign.ts`
2. Criar interface de repositório em `domain/repositories/ICampaignRepository.ts`
3. Implementar repositório em `infrastructure/prisma/repositories/CampaignRepository.ts`
4. Criar DTOs em `application/dto/CampaignDTO.ts`
5. Criar use cases em `application/use-cases/CampaignUseCases.ts`
6. Criar controller em `presentation/controllers/CampaignController.ts`
7. Criar rotas em `presentation/routes/campaignRoutes.ts`
8. Registrar rotas em `src/infrastructure/http/server.ts`

📖 **Ver `HOW_TO_ADD_FEATURES.md` para exemplo completo!**

---

## 🗄️ BANCO DE DADOS:

### Tabelas já no Schema Prisma:

- **PUBLIC_USER** → User
- **PUBLIC_CAMPAIGN** → Campaign
- **PUBLIC_CAMPAIGN_MEMBER** → CampaignMember
- **PUBLIC_CHARACTER** → Character
- **PUBLIC_RACE** → Race
- **PUBLIC_CLASS** → Class
- **PUBLIC_CHARACTER_ITEM** → CharacterItem
- **PUBLIC_CHARACTER_SPELL** → CharacterSpell
- **PUBLIC_ITEM_TEMPLATE** → ItemTemplate
- **PUBLIC_SPELL_TEMPLATE** → SpellTemplate
- **PUBLIC_MONSTER** → Monster
- **PUBLIC_MONSTER_TEMPLATE** → MonsterTemplate
- **PUBLIC_MESSAGE** → Message
- **PUBLIC_SESSION** → Session
- **PUBLIC_COMBAT_ENCOUNTER** → CombatEncounter
- **PUBLIC_MAP** → Map
- **PUBLIC_PLAYER_CHARACTER** → PlayerCharacter

---

## ⚙️ VARIÁVEIS DE AMBIENTE:

```env
DATABASE_URL=postgresql://postgres:tdvlkw1!@localhost:5432/mestria
PORT=3000
NODE_ENV=development
JWT_SECRET=dev-secret
JWT_EXPIRATION=7d
GROQ_API_KEY=sua-chave-aqui
OLLAMA_URL=http://localhost:11434
SOCKET_IO_CORS_ORIGIN=http://localhost:5173
```

---

## 🎯 ARQUITETURA - FLUXO DE REQUISIÇÃO:

```
HTTP Request → Controller → Use Case → Repository → Prisma → PostgreSQL
                   ↓           ↓          ↓           ↓
             Parse JSON   Orquestra   Implementa   Executa
             Validação    Lógica      Contrato     SQL
             básica       Negócio     (Interface)

PostgreSQL → Prisma → Repository → Use Case → DTO → Controller → JSON Response
```

---

## 🧪 EXEMPLO DE USO (Depois de rodar):

```typescript
// src/main.ts - Já está pronto!
// Apenas execute: npm run dev:watch

// Criar um usuário:
POST /api/users
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}

// Response 201:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "João Silva",
  "email": "joao@example.com",
  "createdAt": "2024-03-12T10:30:00Z",
  "updatedAt": "2024-03-12T10:30:00Z"
}

// Buscar usuário:
GET /api/users/550e8400-e29b-41d4-a716-446655440000

// Response 200:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "João Silva",
  "email": "joao@example.com",
  "createdAt": "2024-03-12T10:30:00Z",
  "updatedAt": "2024-03-12T10:30:00Z"
}
```

---

## 🚨 CHECKLIST FINAL:

- ✅ Prisma schema com todas as tabelas
- ✅ Arquitetura limpa implementada
- ✅ Docker configurado (PostgreSQL + API + Ollama)
- ✅ TypeScript com paths aliases
- ✅ Exemplo funcional (User feature)
- ✅ Documentação completa
- ✅ .env.example e .env.local
- ✅ ESLint e Prettier

---

## ❓ DÚVIDAS FREQUENTES:

**P: Como adiciono uma nova tabela?**
R: Atualize o schema Prisma, rode `npm run prisma:migrate`, depois siga o padrão em `HOW_TO_ADD_FEATURES.md`

**P: Como testo a API localmente?**
R: Use Postman, Insomnia ou `curl`. Os endpoints estarão em `http://localhost:3000/api/*`

**P: Por que separar em camadas?**
R: Facilita testes, manutenção, e mudanças futuras (ex: trocar PostgreSQL por outro BD)

**P: Como funciona o Circuit Breaker com IA?**
R: Será implementado em `src/infrastructure/ai/` com fallback Groq → Ollama

**P: Preciso commitar .env.local?**
R: ❌ Não! Está no .gitignore. Use apenas para desenvolvimento local.

---

## 📞 SUPORTE:

- Documentação: Leia `ARCHITECTURE.md` para entender melhor
- Exemplos: Veja User feature como referência
- Dúvidas de uso: Verifique `HOW_TO_ADD_FEATURES.md`

---

## 🎓 APRENDER MAIS:

- **Arquitetura Limpa**: Clean Architecture - Robert C. Martin
- **DDD**: Domain-Driven Design - Eric Evans  
- **Prisma Docs**: https://www.prisma.io/docs/
- **Express**: https://expressjs.com/
- **TypeScript**: https://www.typescriptlang.org/docs/

---

**Status**: 🟢 Backend pronto para desenvolvimento!

Próximas features a implementar:
- [ ] Autenticação JWT
- [ ] Campanhas CRUD
- [ ] WebSockets para chat
- [ ] Integração com Groq API
- [ ] Sistema de combate
- [ ] Personagens CRUD

**Bom desenvolvimento! 🚀**
