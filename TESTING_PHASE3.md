# Guia de Testes - Fase 3

## 1. Teste de Chat (WebSocket)

### Cliente JavaScript/Node.js

```javascript
const { io } = require('socket.io-client');

const socket = io('http://localhost:3000', {
  reconnection: true,
});

// Conectar à campanha
socket.emit('join-campaign', {
  campaignId: 'camp_123',
  userId: 'user_123',
});

// Enviar mensagem
socket.emit('send-message', {
  campaignId: 'camp_123',
  userId: 'user_123',
  senderRole: 'USER',
  content: 'Olá a todos!',
});

// Indicar que está digitando
socket.emit('user-typing', {
  campaignId: 'camp_123',
  userId: 'user_123',
});

// Parar de digitar
socket.emit('user-stop-typing', {
  campaignId: 'camp_123',
  userId: 'user_123',
});

// Escutar mensagens
socket.on('new-message', (msg) => {
  console.log(`${msg.senderId}: ${msg.content}`);
});

socket.on('user-joined', (data) => {
  console.log(`${data.userId} entrou na campanha`);
});

socket.on('user-typing', (data) => {
  console.log(`${data.userId} está digitando...`);
});

// Health check
socket.emit('ping');
socket.on('pong', (data) => {
  console.log(`Pong recebido em ${data.timestamp}`);
});
```

---

## 2. Teste de Histórico de Chat (HTTP)

```bash
# Obter últimas 50 mensagens
curl -X GET http://localhost:3000/api/messages/campaign/camp_123

# Obter últimas 10 mensagens com paginação
curl -X GET "http://localhost:3000/api/messages/campaign/camp_123?limit=10"

# Enviar mensagem de sistema
curl -X POST http://localhost:3000/api/messages/campaign/camp_123/system \
  -H "Content-Type: application/json" \
  -d '{
    "content": "O DM anuncia algo importante!"
  }'

# Limpar histórico
curl -X DELETE http://localhost:3000/api/messages/campaign/camp_123
```

---

## 3. Teste de Rolagem de Dados

### Sem autenticação (Public endpoint)

```bash
# Rolar um d20
curl -X POST http://localhost:3000/api/combat/dice/roll \
  -H "Content-Type: application/json" \
  -d '{
    "expression": "d20"
  }'

# Resposta:
{
  "dice": "d20",
  "rolls": [15],
  "modifier": 0,
  "total": 15,
  "isNatural20": false,
  "isNatural1": false,
  "advantage": false,
  "disadvantage": false,
  "description": "Rolagem: d20 [15] = 15"
}

# Rolar 2d6 + 3
curl -X POST http://localhost:3000/api/combat/dice/roll \
  -H "Content-Type: application/json" \
  -d '{
    "expression": "2d6+3"
  }'

# Rolar d20 com vantagem
curl -X POST http://localhost:3000/api/combat/dice/roll \
  -H "Content-Type: application/json" \
  -d '{
    "expression": "d20",
    "advantage": true
  }'

# Rolar d20 com desvantagem
curl -X POST http://localhost:3000/api/combat/dice/roll \
  -H "Content-Type: application/json" \
  -d '{
    "expression": "d20",
    "disadvantage": true
  }'
```

---

## 4. Teste de Combate (Requer Autenticação)

### A. Iniciar um Encontro

```bash
curl -X POST http://localhost:3000/api/combat/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "campaignId": "camp_123",
    "encounterId": "enc_456",
    "playerCharacterIds": ["char_johnny", "char_maria"],
    "monsterIds": ["mon_goblin_1", "mon_goblin_2"]
  }'

# Resposta esperada:
{
  "success": true,
  "encounterId": "enc_456",
  "round": 1,
  "currentTurn": {
    "id": "part_123",
    "characterId": "char_johnny",
    "name": "Johnny",
    "hpCurrent": 30,
    "hpMax": 30,
    "armorClass": 14,
    "initiativeResult": 18,
    "dexterityModifier": 3,
    "isPlayerCharacter": true
  },
  "participants": [
    {
      "id": "part_123",
      "name": "Johnny",
      "hpCurrent": 30,
      "hpMax": 30,
      "initiativeResult": 18
    },
    {
      "id": "part_456",
      "name": "Maria",
      "hpCurrent": 25,
      "hpMax": 25,
      "initiativeResult": 14
    },
    {
      "id": "part_789",
      "name": "Goblin 1",
      "hpCurrent": 7,
      "hpMax": 7,
      "initiativeResult": 10
    }
  ]
}
```

### B. Obter Estado do Combate

```bash
curl -X GET "http://localhost:3000/api/combat/enc_456/state?campaignId=camp_123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Resposta:
{
  "encounterId": "enc_456",
  "round": 1,
  "currentTurn": {
    "id": "part_123",
    "characterId": "char_johnny",
    "name": "Johnny",
    "hpCurrent": 30,
    "hpMax": 30,
    "armorClass": 14,
    "initiativeResult": 18,
    "isPlayerCharacter": true
  },
  "participants": [...]
}
```

### C. Executar Ataque

```bash
curl -X POST http://localhost:3000/api/combat/enc_456/action \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "campaignId": "camp_123",
    "participantId": "part_123",
    "action": "attack",
    "targetId": "part_789"
  }'

# Resposta esperada:
{
  "success": true,
  "action": "attack",
  "result": {
    "type": "attack",
    "success": true,
    "isCritical": false,
    "message": "Johnny ataca Goblin 1 e acerta! 6 de dano. (1/7 HP)",
    "attackRoll": 16,
    "damageRoll": 6,
    "hpRemaining": 1
  }
}
```

### D. Executar Feitiço

```bash
curl -X POST http://localhost:3000/api/combat/enc_456/action \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "campaignId": "camp_123",
    "participantId": "part_456",
    "action": "spell",
    "targetId": "part_789",
    "spellName": "Bola de Fogo"
  }'

# Resposta esperada:
{
  "success": true,
  "action": "spell",
  "result": {
    "type": "spell",
    "success": true,
    "message": "Maria lança **Bola de Fogo** em Goblin 1! 12 de dano (0/7 HP)",
    "damageRoll": 12,
    "hpRemaining": 0
  }
}
```

### E. Dodge (Esquiva)

```bash
curl -X POST http://localhost:3000/api/combat/enc_456/action \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "campaignId": "camp_123",
    "participantId": "part_123",
    "action": "dodge"
  }'

# Resposta:
{
  "success": true,
  "action": "dodge",
  "result": {
    "type": "dodge",
    "success": true,
    "message": "Johnny se coloca em posição defensiva. AC aumentado em +2 até o próximo turno."
  }
}
```

### F. Move (Movimento)

```bash
curl -X POST http://localhost:3000/api/combat/enc_456/action \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "campaignId": "camp_123",
    "participantId": "part_123",
    "action": "move"
  }'
```

### G. Help (Ajudar Aliado)

```bash
curl -X POST http://localhost:3000/api/combat/enc_456/action \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "campaignId": "camp_123",
    "participantId": "part_123",
    "action": "help",
    "targetId": "part_456"
  }'
```

### H. Finalizar Combate

```bash
curl -X POST http://localhost:3000/api/combat/enc_456/end \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "campaignId": "camp_123"
  }'

# Resposta:
{
  "success": true,
  "message": "Combate finalizado"
}
```

---

## 5. Cenário Completo de Teste

### Setup Inicial

1. **Registrar e fazer login** (de fases anteriores)
   ```bash
   # Registrar
   POST /api/users
   { "email": "player@example.com", "password": "senha123" }

   # Login
   POST /api/users/auth/login
   { "email": "player@example.com", "password": "senha123" }
   # Salve o token JWT retornado
   ```

2. **Criar campanha**
   ```bash
   POST /api/campaigns
   { "title": "Masmorra dos Dragões", "description": "Uma aventura épica..." }
   ```

3. **Criar personagens**
   ```bash
   POST /api/characters
   {
     "name": "Johnny",
     "level": 5,
     "hpMax": 30,
     "hpCurrent": 30,
     "raceId": "race_human",
     "classId": "class_fighter",
     "campaignId": "camp_123",
     "attributes": {
       "strength": 16,
       "dexterity": 14,
       "constitution": 15,
       "intelligence": 10,
       "wisdom": 12,
       "charisma": 13
     }
   }
   ```

### Teste de Combate

1. Iniciar combate com `POST /api/combat/start`
2. Obter estado com `GET /api/combat/{id}/state`
3. Executar ações com `POST /api/combat/{id}/action`
4. Verificar histórico de chat com `GET /api/messages/campaign/{id}`
5. Finalizar com `POST /api/combat/{id}/end`

---

## 6. Verificação de Banco de Dados

Depois dos testes, verifique as tabelas:

```sql
-- Mensagens de chat
SELECT * FROM Message WHERE campaignId = 'camp_123'
ORDER BY createdAt DESC LIMIT 10;

-- Log de combate
SELECT * FROM CombatLog WHERE encounterId = 'enc_456'
ORDER BY createdAt DESC;

-- Personagens atualizados
SELECT id, name, hpCurrent, hpMax FROM Character WHERE campaignId = 'camp_123';
```

---

## 7. Observações Importantes

### Autenticação
- Endpoints `/combat/dice/roll` **NÃO** requerem token
- Todos os outros endpoints `/api/combat/*` **REQUEREM** Bearer token no header
- `Authorization: Bearer <JWT_TOKEN>`

### Validações
- Rolagem de dados só aceita: d4, d6, d8, d10, d12, d20, d100
- Modificador de ataque/dano limitado a ±10 por validação
- HP não pode ficar negativo (mínimo 0)
- Níveis de spell limitados a 1-9

### Eventos em Tempo Real
- Quando uma ação é executada em `/api/combat/*/action`:
  - A ação é salva em `CombatLog`
  - Uma mensagem é enviada auto via `chatService.sendSystemMessage()`
  - Todos na campanha recebem via Socket.io em tempo real

---

## Teste Rápido (Sem Banco de Dados Real)

```bash
# Isso não requer nenhuma campanha/personagem criado:
curl -X POST http://localhost:3000/api/combat/dice/roll \
  -H "Content-Type: application/json" \
  -d '{"expression": "2d20+5"}'

# Deve retornar algo como:
{
  "dice": "2d20+5",
  "rolls": [14, 18],
  "modifier": 5,
  "total": 23,
  "isNatural20": false,
  "isNatural1": false,
  "description": "Rolagem: 2d20 [14, 18] +5 = 23"
}
```

---

## Troubleshooting

### Erro: "Combat service não inicializado"
→ Verificar se `src/infrastructure/http/server.ts` tem a inicialização do `CombatService`

### Erro: "Cannot find module"
→ Executar `npm run build` novamente para recompilar

### WebSocket não conecta
→ Verificar CORS em `createServer()` - padrão é `http://localhost:5173`
→ Mudar em `.env`: `SOCKET_IO_CORS_ORIGIN=http://seu-frontend:porta`

### Mensagens não persistem
→ Verificar se `Message` table existe no schema do Prisma
→ Rodar `npx prisma migrate dev` se necessário
