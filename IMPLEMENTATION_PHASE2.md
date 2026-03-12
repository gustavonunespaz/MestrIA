# Implementação - Fase 2: Autenticação, Campanhas e Personagens

Data: Março 2026
Status: Completo

## O que foi implementado

### 1. Autenticação JWT
- **JWTService** - Geração, verificação e gestão de tokens JWT
  - Geração de access token (24h)
  - Geração de refresh token (7d)
  - Verificação de tokens
  - Decodificação de tokens
  - Validação de expiração

- **AuthMiddleware** - Proteção de rotas
  - `authMiddleware` - Valida token obrigatório
  - `optionalAuthMiddleware` - Permite autenticação opcional
  - Extrai userId e email do token
  - Retorna erros 401 apropriados

- **LoginUseCase** - Autenticação de usuários
  - Valida email e senha
  - Hash de senhas com bcrypt
  - Retorna tokens de acesso e refresh

### 2. User Features (Melhorado)
- **Novo Endpoint**: `POST /api/users/auth/login`
  - Permite autenticação baseada em email/senha
  - Retorna token de acesso e refresh token
  - Dados de usuário na resposta

- **UserController Atualizado**
  - Método `login()` implementado
  - Integração com LoginUseCase

- **Rotas Atualizadas**
  - POST /api/users - Criar (sem auth)
  - POST /api/users/auth/login - Login
  - GET /api/users/:id - Get (requer autenticação)

### 3. Campaign CRUD (Completo)
**Arquivos Criados:**
- `src/domain/entities/Campaign.ts` - Entity
- `src/domain/repositories/ICampaignRepository.ts` - Interface
- `src/infrastructure/prisma/repositories/CampaignRepository.ts` - Implementação
- `src/application/dto/CampaignDTO.ts` - DTOs
- `src/application/use-cases/CampaignUseCases.ts` - 5 use cases
- `src/presentation/controllers/CampaignController.ts` - Controller
- `src/presentation/routes/campaignRoutes.ts` - Rotas

**Use Cases Implementados:**
1. **CreateCampaignUseCase** - Cria nova campanha
   - Gera código de convite automático
   - Valida título e descrição
   - Associa ao criador (userId)

2. **GetCampaignByIdUseCase** - Busca campanha por ID
3. **UpdateCampaignUseCase** - Atualiza campanha
4. **DeleteCampaignUseCase** - Deleta campanha
5. **ListCampaignsByCreatorUseCase** - Lista campanhas do criador

**Endpoints Campaign:**
```
POST   /api/campaigns              # Criar (requer auth)
GET    /api/campaigns/:id         # Get por ID (requer auth)
PUT    /api/campaigns/:id         # Atualizar (requer auth)
DELETE /api/campaigns/:id         # Deletar (requer auth)
GET    /api/campaigns/list        # Listar suas campanhas (requer auth)
```

### 4. Character CRUD (Completo)
**Arquivos Criados:**
- `src/domain/entities/Character.ts` - Entity
- `src/domain/repositories/ICharacterRepository.ts` - Interface
- `src/infrastructure/prisma/repositories/CharacterRepository.ts` - Implementação
- `src/application/dto/CharacterDTO.ts` - DTOs
- `src/application/use-cases/CharacterUseCases.ts` - 6 use cases
- `src/presentation/controllers/CharacterController.ts` - Controller
- `src/presentation/routes/characterRoutes.ts` - Rotas

**Use Cases Implementados:**
1. **CreateCharacterUseCase** - Cria novo personagem
   - Valida nome (mín. 2 caracteres)
   - Valida nível (1-20)
   - Calcula HP baseado em constituição
   - Associa ao criador (userId) e campanha

2. **GetCharacterByIdUseCase** - Busca personagem por ID
3. **UpdateCharacterUseCase** - Atualiza dados do personagem
4. **DeleteCharacterUseCase** - Deleta personagem
5. **ListCharactersByCampaignUseCase** - Lista personagens da campanha
6. **ListCharactersByUserUseCase** - Lista personagens do usuário

**Endpoints Character:**
```
POST   /api/characters                 # Criar (requer auth)
GET    /api/characters/:id            # Get por ID (requer auth)
PUT    /api/characters/:id            # Atualizar (requer auth)
DELETE /api/characters/:id            # Deletar (requer auth)
GET    /api/characters/campaign/list  # Listar por campanha (requer auth)
GET    /api/characters/user/list      # Listar seus personagens (requer auth)
```

### 5. Server e Rotas Atualizadas
- **server.ts** - Registrou novas rotas
  - `userRoutes` - /api/users
  - `campaignRoutes` - /api/campaigns
  - `characterRoutes` - /api/characters
  - `aiRoutes` - /api/ai (já existente)

### 6. Database Seed Português
- Atualizado prisma/seed.ts com textos em português
- Raças: Humano, Elfo, Anão, Halfling
- Classes: Bárbaro, Bardo, Clérigo, Druida, Guerreiro, Monge, Paladino, Patrulheiro, Ladino, Feiticeiro, Bruxo, Mago
- Feitiços: Bola de Fogo, Míssil Mágico, Palavra de Cura, Raio Relampejante
- Itens: Espada Longa, Armadura de Placas, Poção de Cura, Espada Curta, Arco
- Monstros: Goblin, Orc, Dragão Filhote, Esqueleto
- Personagens: Thordak Ferrajura, Liriel Sussurro da Lua, Aramina Música Dourada

### 7. Compilação TypeScript
- Todas as dependências instaladas (jsonwebtoken, @types/jsonwebtoken)
- Compilação sem erros: ✅ 0 errors
- Código TypeScript seguro com tipos

## Padrões Mantidos

Todos os novos features seguiram o padrão Clean Architecture:

```
Presentation Layer (Controllers + Routes)
        ↓
Application Layer (DTOs + Use Cases)
        ↓
Domain Layer (Entities + Repositories/Interfaces)
        ↓
Infrastructure Layer (Prisma Repositories + Services)
        ↓
Shared Layer (Errors + Utils)
```

## Segurança

- Autenticação obrigatória para endpoints sensíveis
- Senhas criptografadas com bcrypt (10 salt rounds)
- JWT com expiração (24h access, 7d refresh)
- Validação de entrada em todos os DTOs
- Tratamento de erros consistente

## Testes Recomendados

### 1. Criar Usuário
```bash
POST /api/users
{
  "name": "Teste",
  "email": "teste@example.com",
  "password": "senha123"
}
```

### 2. Login
```bash
POST /api/users/auth/login
{
  "email": "teste@example.com",
  "password": "senha123"
}
# Resposta inclui: id, name, email, token, refreshToken
```

### 3. Criar Campanha
```bash
POST /api/campaigns
Headers: Authorization: Bearer <token>
{
  "title": "Minha Campanha",
  "description": "Uma aventura épica e perigosa",
  "systemBase": "D&D 5ª Edição",
  "dmType": "AI"
}
```

### 4. Criar Personagem
```bash
POST /api/characters
Headers: Authorization: Bearer <token>
{
  "name": "Novo Herói",
  "campaignId": "<campaign_id>",
  "raceId": "<race_id>",
  "classId": "<class_id>",
  "level": 1,
  "hpCurrent": 10,
  "hpMax": 10,
  "attributes": {
    "strength": 15,
    "dexterity": 10,
    "constitution": 12,
    "intelligence": 14,
    "wisdom": 13,
    "charisma": 11
  }
}
```

## Próximos Passos

1. **WebSocket Chat Real-time** (em progresso)
   - Implementar eventos de mensagem
   - Broadcast para todos na campanha
   - Persistir mensagens no DB

2. **Combate Sistema**
   - Combat Initiative
   - Turn Order
   - Actions and Attacks
   - HP Management

3. **Dice Rolling System**
   - D4, D6, D8, D10, D12, D20
   - Advantage/Disadvantage
   - Dice Pool mechanics

4. **NPC System**
   - NPC Creation
   - NPC Stats
   - NPC Inventory

5. **Quest System**
   - Quest Creation
   - Quest Progress
   - Rewards

## Arquivos Modificados

### Novos Arquivos (15)
1. src/infrastructure/auth/JWTService.ts
2. src/presentation/middlewares/authMiddleware.ts
3. src/domain/entities/Campaign.ts
4. src/domain/repositories/ICampaignRepository.ts
5. src/infrastructure/prisma/repositories/CampaignRepository.ts
6. src/application/dto/CampaignDTO.ts
7. src/application/use-cases/CampaignUseCases.ts
8. src/presentation/controllers/CampaignController.ts
9. src/presentation/routes/campaignRoutes.ts
10. src/domain/entities/Character.ts
11. src/domain/repositories/ICharacterRepository.ts
12. src/infrastructure/prisma/repositories/CharacterRepository.ts
13. src/application/dto/CharacterDTO.ts
14. src/application/use-cases/CharacterUseCases.ts
15. src/presentation/controllers/CharacterController.ts
16. src/presentation/routes/characterRoutes.ts

### Arquivos Atualizados (6)
1. src/application/dto/UserDTO.ts - Adicionou LoginDTO, LoginResponseDTO
2. src/application/use-cases/UserUseCases.ts - Adicionou LoginUseCase
3. src/presentation/controllers/UserController.ts - Adicionou login()
4. src/presentation/routes/useRoutes.ts - Adicionou rota de login
5. src/infrastructure/http/server.ts - Registrou novas rotas
6. prisma/seed.ts - Textos em português

## Linguagem

- Código: TypeScript (mantém consistência)
- Mensagens de log: Português
- Documentação: Ambas
- Dados de teste: Português

## Resumo Técnico

- **Novos Controllers**: 3 (User atualizado, Campaign novo, Character novo)
- **Use Cases criados**: 13 (Login + 5 Campaign + 6 Character + 1 User restante)
- **Repositórios criados**: 2 (Campaign, Character)
- **Rotas adicionadas**: 14 endpoints novos
- **Dependências adicionadas**: 2 (jsonwebtoken, @types/jsonwebtoken)
- **Linhas de código**: ~3500 (nova implementação)
- **TypeScript Errors**: 0
- **Build Status**: ✅ Sucesso

---

**Próxima Sessão**: Implementar WebSocket chat real-time e continuar com combate/dice rolling
