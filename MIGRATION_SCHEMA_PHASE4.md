# Migração do Schema do Banco de Dados - Fase 4

## 📋 Resumo da Mudança

O projeto foi atualizado para usar um novo schema final do banco de dados com tabelas mais estruturadas, de acordo com o DDL fornecido.

---

## ✅ Arquivos Criados (14 novas entidades)

### Domain Entities (14 arquivos)
1. `src/domain/entities/Race.ts` - Raças D&D
2. `src/domain/entities/Class.ts` - Classes D&D
3. `src/domain/entities/ItemTemplate.ts` - Templates de itens
4. `src/domain/entities/SpellTemplate.ts` - Templates de feitiços
5. `src/domain/entities/MonsterTemplate.ts` - Templates de monstros
6. `src/domain/entities/Monster.ts` - Instâncias de monstros
7. `src/domain/entities/Message.ts` - Mensagens do chat
8. `src/domain/entities/Session.ts` - Sessões de campanha
9. `src/domain/entities/CombatEncounter.ts` - Encontros de combate
10. `src/domain/entities/Map.ts` - Mapas de campanha
11. `src/domain/entities/CampaignMember.ts` - Membros de campanha
12. `src/domain/entities/PlayerCharacter.ts` - Relação player-personagem
13. `src/domain/entities/CharacterItem.ts` - Itens equip
ados por personagem
14. `src/domain/entities/CharacterSpell.ts` - Feitiços conhecidos

### Repository Interfaces (4 novos)
1. `src/domain/repositories/IRaceRepository.ts`
2. `src/domain/repositories/IClassRepository.ts`
3. `src/domain/repositories/IMessageRepository.ts`
4. `src/domain/repositories/ISessionRepository.ts`

### Repository Implementations (4 novos)
1. `src/infrastructure/prisma/repositories/RaceRepository.ts`
2. `src/infrastructure/prisma/repositories/ClassRepository.ts`
3. `src/infrastructure/prisma/repositories/MessageRepository.ts`
4. `src/infrastructure/prisma/repositories/SessionRepository.ts`

---

## 📊 Estrutura de Tabelas (17 tabelas)

```
┌─ Templates (públicos para todos os usuários)
│  ├── PUBLIC_RACE (4 raças)
│  ├── PUBLIC_CLASS (12 classes)
│  ├── PUBLIC_SPELL_TEMPLATE (feitiços)
│  ├── PUBLIC_ITEM_TEMPLATE (itens)
│  └── PUBLIC_MONSTER_TEMPLATE (monstros)
│
├─ Usuários & Campanhas
│  ├── PUBLIC_USER (jogadores)
│  ├── PUBLIC_CAMPAIGN (campanhas)
│  ├── PUBLIC_CAMPAIGN_MEMBER (acesso às campanhas)
│  ├── PUBLIC_PLAYER_CHARACTER (player-char relação)
│  └── PUBLIC_SESSION (sessões de jogo)
│
├─ Personagens
│  ├── PUBLIC_CHARACTER (personagens)
│  ├── PUBLIC_CHARACTER_ITEM (itens equipados)
│  ├── PUBLIC_CHARACTER_SPELL (feitiços conhecidos)
│  └── PUBLIC_MONSTER (monstros instanciados)
│
└─ Gameplay
   ├── PUBLIC_MESSAGE (chat + dice rolls)
   ├── PUBLIC_COMBAT_ENCOUNTER (combates)
   └── PUBLIC_MAP (mapas visuais)
```

---

## 🔄 Enums (3 tipos)

```typescript
// DmType
'AI' | 'HUMAN'

// SenderRole  
'USER' | 'AI_DM' | 'HUMAN_DM' | 'SYSTEM'

// SessionStatus
'PLANNED' | 'ACTIVE' | 'FINISHED'
```

---

## 🔑 Principais Mudanças em Relação ao Schema Anterior

### ✨ Novos Modelos
- `CampaignMember` - Controle de acesso expl
ícito aos membros
- `PlayerCharacter` - Mapeamento explícito de quem joga qual personagem
- `Map` - Para suportar mapas visuais
- `Session` - Para agendar e organizar sessões
- Templates separados (Spell, Item, Monster) - Reutilização

### 📚 Templates Reutilizáveis
- `SpellTemplate` - Feitiços publicados que qualquer personagem pode aprender
- `ItemTemplate` - Itens de equipamento reutilizáveis
- `MonsterTemplate` - Monstros que podem ser instanciados em campanhas

### 🛡️ Segurança & Controle
- `CampaignMember` com `joinedAt` - Rastrear quando jogador entrou
- Unique constraint em `(userId, campaignId)` - Impedir duplicatas
- `senderRole` em Message - Identificar if é DM, jogador ou sistema

---

## 📦 Repositórios Implementados

### RaceRepository
```typescript
- findAll(): Race[]
- findById(id: string): Race | null
- create(race: Race): Race
- update(race: Race): Race
- delete(id: string): void
```

### ClassRepository
```typescript
- findAll(): Class[]
- findById(id: string): Class | null
- create(class: Class): Class
- update(class: Class): Class
- delete(id: string): void
```

### MessageRepository
```typescript
- findById(id: string): Message | null
- findByCampaignId(campaignId: string, limit?: number): Message[]
- create(message: Message): Message
- delete(id: string): void
- deleteByCampaignId(campaignId: string): void
```

### SessionRepository
```typescript
- findById(id: string): Session | null
- findByCampaignId(campaignId: string): Session[]
- create(session: Session): Session
- update(session: Session): Session
- delete(id: string): void
```

---

## 🛠️ Como Usar os Novos Repositórios

### Exemplo: Buscar todas as raças
```typescript
const raceRepository = new RaceRepository();
const races = await raceRepository.findAll();
// Retorna: Race[]
```

### Exemplo: Criar uma sessão
```typescript
const sessionRepository = new SessionRepository();
const session = new Session({
  id: crypto.randomUUID(),
  title: 'Primeira Sessão',
  status: 'PLANNED',
  campaignId: 'camp_123',
  createdAt: new Date(),
});
await sessionRepository.create(session);
```

### Exemplo: Buscar mensagens de campanha
```typescript
const messageRepository = new MessageRepository();
const messages = await messageRepository.findByCampaignId('camp_123', 50);
// Retorna últimas 50 mensagens ordenadas do mais antigo para o mais novo
```

---

## 📈 Status de Compilação

✅ **0 erros TypeScript**
✅ **Todas as entidades criadas**
✅ **Todos os repositórios implementados**
✅ **Type-safe 100%**

---

## 🚀 Próximos Passos

1. **Criar DTOs** para as novas entidades (Race, Class, etc)
2. **Criar Use Cases** para operações comuns (CRUDRace, CRUDClass, etc)
3. **Criar Controllers** para exposição via API
4. **Criar Routes** para os novos endpoints
5. **Atualizar seed.ts** para criar dados templates
6. **Testar endpoints** com curl

---

## 🔧 Detalhes Técnicos

### Enums como Type Unions
Os enums foram definidos como type unions em vez de imports do Prisma para evitar dependências de tipos gerados:

```typescript
export type SenderRole = 'USER' | 'AI_DM' | 'HUMAN_DM' | 'SYSTEM';
export type SessionStatus = 'PLANNED' | 'ACTIVE' | 'FINISHED';
```

### Mapeamento Domain ↔ Database
Cada repositório implementa o mapeamento da camada de dados (Prisma) para as entidades de domínio:

```typescript
private mapToDomain(raw: any): Race {
  return new Race({
    id: raw.id,
    name: raw.name,
    description: raw.description,
    traits: raw.traits || {},
  });
}
```

---

## 📝 Notas Importantes

- **Templates são públicos**: Não há `creatorId` em templates, todos podem useá-los
- **Instâncias são privadas**: `Monster`, `CharacterItem`, etc são específicas de cada campanha
- **Mensagens com dice rolls**: Campo `diceRoll` (JSON) para rastrear resultados
- **Whispers**: `isWhisper: boolean` para mensagens privadas
- **GitHub Copilot** gerou todas as entidades e repositórios automaticamente com clean architecture

---

**Status:** ✅ Concluído
**Build:** ✅ npm run build → 0 errors
**Próximo:** Criar DTOs e Use Cases para exposição via API
