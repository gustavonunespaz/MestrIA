# Fase 3: Implementação - WebSocket Chat, Dice Rolling & Combat

## Resumo de Mudanças

### 1. **Sistema de Chat em Tempo Real (WebSocket)**

#### Arquivos Criados:
- `src/infrastructure/socket/ChatService.ts` - Gerenciador de chat com Socket.io
- `src/presentation/routes/messageRoutes.ts` - Endpoints HTTP para histórico

#### Funcionalidades:
- ✅ Conexão em tempo real via Socket.io
- ✅ Salas por campanha (`campaign:{campaignId}`)
- ✅ Envio de mensagens persistidas no banco
- ✅ Indicador de digitação
- ✅ Histórico de mensagens (GET com paginação)
- ✅ Mensagens de sistema
- ✅ Desconexão automática

#### Eventos Socket.io:

```javascript
// Cliente → Servidor
socket.emit('join-campaign', { campaignId: string, userId: string })
socket.emit('send-message', { campaignId, userId, senderRole, content })
socket.emit('user-typing', { campaignId, userId })
socket.emit('user-stop-typing', { campaignId, userId })
socket.emit('ping') // health check

// Servidor → Cliente
socket.on('user-joined', { userId, socketId, timestamp })
socket.on('new-message', { id, content, senderId, senderRole, campaignId, createdAt })
socket.on('user-typing', { userId, timestamp })
socket.on('user-stop-typing', { userId })
socket.on('user-left', { userId, timestamp })
socket.on('chat-cleared', { campaignId, timestamp })
socket.on('pong', { timestamp })
```

#### Endpoints HTTP:

```bash
# Obter histórico de chat
GET /api/messages/campaign/{campaignId}?limit=50

# Enviar mensagem de sistema (admin)
POST /api/messages/campaign/{campaignId}/system
{
  "content": "Uma mensagem de sistema"
}

# Limpar chat (admin)
DELETE /api/messages/campaign/{campaignId}
```

---

### 2. **Sistema de Rolagem de Dados**

#### Arquivo Criado:
- `src/shared/utils/DiceRoller.ts` - Utilitário de rolagem de dados D&D

#### Funcionalidades Suportadas:

```typescript
// Roll simples
DiceRoller.roll('d20')                    // Basic d20
DiceRoller.roll('2d6')                    // Multiple dice
DiceRoller.roll('1d20+5')                 // Com modificador
DiceRoller.roll('2d8-2')                  // Com penalidade

// Advantage/Disadvantage (D&D 5e)
DiceRoller.roll('d20', { advantage: true })      // Rola 2d20, pega maior
DiceRoller.roll('d20', { disadvantage: true })   // Rola 2d20, pega menor

// Métodos especializados
DiceRoller.attackRoll(2)                  // d20 + bônus de ataque
DiceRoller.damageRoll('1d8', 2)           // 1d8 + 2 dano
DiceRoller.abilityCheck(3, 2)             // d20 + MOD + proficiency
DiceRoller.savingThrow(2, 0)              // Save (similar a ability check)

// Atributo para modificador D&D
DiceRoller.getAttributeModifier(16)       // +3 (para INT 16)

// Múltiplos dados com threshold
DiceRoller.rollMultipleWithThreshold(4, 6, 10)  // 4d6 vs DC 10
```

#### Retorno de Roll:

```typescript
interface DiceRoll {
  dice: string;              // "2d6+1"
  rolls: number[];           // [4, 3]
  modifier: number;          // 1
  total: number;             // 8
  isNatural20: boolean;      // true se d20 resultou em 20
  isNatural1: boolean;       // true se d20 resultou em 1
  advantage?: boolean;       // Vantage type (se aplicável)
  disadvantage?: boolean;
  description: string;       // "Rolagem: 2d6 [4, 3] +1 = 8"
}
```

#### Endpoint HTTP:

```bash
# Rolar dados
POST /api/combat/dice/roll
{
  "expression": "2d20+5",
  "advantage": false,
  "disadvantage": false
}

# Exemplo de resposta:
{
  "dice": "2d20+5",
  "rolls": [15, 12],
  "modifier": 5,
  "total": 20,
  "isNatural20": false,
  "isNatural1": false,
  "description": "Rolagem: 2d20 [15, 12] +5 = 20"
}
```

---

### 3. **Sistema de Combate**

#### Arquivos Criados:
- `src/infrastructure/services/CombatService.ts` - Lógica de combate com rodadas e turnos
- `src/presentation/controllers/CombatController.ts` - Endpoints de combate

#### Fluxo de Combate:

1. **Iniciar Combate**
   ```bash
   POST /api/combat/start
   {
     "campaignId": "camp123",
     "encounterId": "enc456",
     "playerCharacterIds": ["char1", "char2"],
     "monsterIds": ["mon1", "mon2"]
   }
   ```
   - Rola iniciativa para todos
   - Ordena por resultado descendente
   - Envia notificação no chat
   - Retorna ordem de turnos

2. **Executar Ação em Combate**
   ```bash
   POST /api/combat/{encounterId}/action
   {
     "campaignId": "camp123",
     "participantId": "part123",
     "action": "attack" | "spell" | "dodge" | "move" | "help",
     "targetId": "part456",
     "spellName": "Bola de Fogo" // opcional
   }
   ```

3. **Tipos de Ação**:

   - **Attack**: d20 + bonus vs CA; dano 1d8 + bônus
   - **Spell**: Busca feitiço, rola ataque, calcula dano por nível
   - **Dodge**: +2 CA até próximo turno
   - **Move**: Movimento livre em combate
   - **Help**: Assistência a aliado

4. **Obter Estado do Combate**
   ```bash
   GET /api/combat/{encounterId}/state?campaignId=camp123
   ```
   Retorna:
   - Round atual
   - Participante no turno
   - Status de todos (HP, CA, etc)

5. **Fim de Combate**
   ```bash
   POST /api/combat/{encounterId}/end
   {
     "campaignId": "camp123"
   }
   ```

#### Fluxo de Ataque (Exemplo):

```
1. Ataque contra CA 14
2. d20 + 2 = [15] + 2 = 17 ✅ Acerta!
3. Dano 1d8 + 2 = [6] + 2 = 8 dano
4. Alvo perde 8 HP (20 → 12 HP)
5. Mensagem: "João ataca Goblin e acerta! 8 de dano. (12/20 HP)"
```

#### Fluxo de Feitiço (Exemplo):

```
1. Feitiço: Bola de Fogo (nível 3)
2. Teste de ataque: d20 + 1 = 18 ✅ Acerta!
3. Dano: 3d6 + 3 = [3, 4, 2] + 3 = 12 dano
4. Alvo: 30 → 18 HP
5. Mensagem: "Mago lança Bola de Fogo em Orc! 12 de dano (18/30 HP)"
```

#### Integração com Chat:

Todas as ações de combate:
- Rolam dados automaticamente
- Enviam resultado no chat da campanha
- Persistem em `CombatLog` no banco
- Atualizam HP em tempo real

---

## Arquitetura Implementada

```
src/
├── infrastructure/
│   ├── socket/
│   │   └── ChatService.ts          ← Gerencia eventos Socket.io
│   └── services/
│       └── CombatService.ts        ← Lógica de combate
├── shared/utils/
│   └── DiceRoller.ts              ← Rolagem de dados D&D
└── presentation/
    ├── routes/
    │   └── messageRoutes.ts        ← Endpoints de histórico
    └── controllers/
        └── CombatController.ts     ← Endpoints de combate
```

---

## Integração no Servidor

No `src/infrastructure/http/server.ts`:

```typescript
// Criar Chat Service
const chatService = new ChatService(io);
setChatService(chatService);

// Criar Combat Service
const combatService = new CombatService(chatService);
setCombatService(combatService);

// Registrar rotas
app.use('/api/messages', messageRoutes);
app.use('/api/combat', combatRoutes);
```

---

## Status de Compilação

✅ **0 erros TypeScript**
✅ **Todos os tipos validados**
✅ **Integração completa com server**

---

## Endpoints Resumidos

### Chat
- `GET /api/messages/campaign/{id}` - Histórico
- `POST /api/messages/campaign/{id}/system` - Mensagem do sistema
- `DELETE /api/messages/campaign/{id}` - Limpar chat

### Combate
- `POST /api/combat/start` - Iniciar encontro
- `GET /api/combat/{id}/state` - Estado do combate
- `POST /api/combat/{id}/action` - Executar ação
- `POST /api/combat/{id}/end` - Fim do combate
- `POST /api/combat/dice/roll` - Rolar dados

### Socket.io (Chat Real-Time)
- `emit: join-campaign` - Entrar em campanha
- `emit: send-message` - Enviar mensagem
- `emit: user-typing` - Indicador
- `on: new-message` - Receeber mensagem
- `on: user-joined` - Usuário entrou

---

## Próximas Implementações

1. [ ] **NPC Interaction System** - Diálogos com NPCs
2. [ ] **Experience & Leveling** - Sistema de XP
3. [ ] **Treasure Loot System** - Distribuição de loot
4. [ ] **Magic Items** - Itens mágicos equipáveis
5. [ ] **Character Advancement** - Avanço de features/skills

---

## Tecnologias Utilizadas

- **Socket.io**: Real-time bidirectional communication
- **Prisma ORM**: Persistência de mensagens e logs
- **TypeScript**: Type-safe dice rolling e combat logic
- **D&D 5e Rules**: Initiative, saving throws, advantage/disadvantage

---

**Data de Conclusão:** Phase 3
**Status:** ✅ Implementado e Compilado
**Próxima:** Testar endpoints via Postman ou cliente web
