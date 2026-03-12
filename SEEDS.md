# Database Seeding - MestrIA

## Overview

Os seeds preenchem o banco de dados com dados fictícios para teste e desenvolvimento.

## O que esta incluido

### Races (4)
- Human
- Elf
- Dwarf
- Halfling

### Classes (12)
- Barbarian, Bard, Cleric, Druid
- Fighter, Monk, Paladin, Ranger
- Rogue, Sorcerer, Warlock, Wizard

### Users (4)
- Alice Silva (alice@example.com)
- Bob Santos (bob@example.com)
- Carol Oliveira (carol@example.com)
- David Costa (david@example.com)

Senha para todos: `password123`

### Spells (4)
- Fireball (Level 3)
- Magic Missile (Level 1)
- Healing Word (Level 1)
- Lightning Bolt (Level 3)

### Items (5)
- Longsword
- Plate Armor
- Health Potion
- Shortsword
- Bow

### Monsters (4 Templates)
- Goblin (CR 0.25)
- Orc (CR 0.5)
- Dragon Wyrmling (CR 2)
- Skeleton (CR 0.125)

### Campaign
- "The Lost Mines of Phandalin" (AI DM)
- Invite Code: CAMP1234
- 3 players

### Characters (3)
- Thordak Ironforge (Dwarf Fighter, Level 5)
- Liriel Moonwhisper (Elf Wizard, Level 5)
- Aramina Goldensong (Human Cleric, Level 5)

### Sessions
- "First Adventure" (ACTIVE)

### Messages
- 3 mensagens iniciais de chat

### Maps
- "Phandalin Town Map" (20x20 grid)

## Como Usar

### 1. Setup Inicial

```bash
# Ir para o diretorio do projeto
cd /home/gustavonunes/MestrIA

# Instalar dependencias
npm install

# Gerar Prisma Client
npm run prisma:generate
```

### 2. Com Docker (Recomendado)

```bash
# Inicia PostgreSQL
docker-compose up -d postgres

# Aguarda o banco estar pronto
sleep 5

# Executa migration
npm run prisma:migrate

# Executa seed
npm run seed
```

### 3. PostgreSQL Local

```bash
# Configurar DATABASE_URL em .env.local
# DATABASE_URL="postgresql://postgres:tdvlkw1!@localhost:5432/mestria"

# Executar migration
npm run prisma:migrate

# Executar seed
npm run seed
```

## Saida esperada

```
Starting database seed...
Cleared existing data
Created 4 races
Created 12 classes
Created 4 users
Created 4 spells
Created 5 items
Created 4 monster templates
Created campaign: The Lost Mines of Phandalin
Added campaign members
Created 3 characters
Added spells to characters
Added items to characters
Created session: First Adventure
Created messages
Created map: Phandalin Town Map
Created combat encounter
Created 2 monster instances
Database seed completed successfully!
```

## Verificar os dados

### Via Prisma Studio

```bash
npm run prisma:studio
```

### Via SQL

```bash
psql -U postgres -d mestria -c "SELECT * FROM PUBLIC_USER;"
```

## Limpar os dados

O seed automaticamente limpa todos os dados antes de recriar:

```typescript
// No inicio do seed.ts
await prisma.characterSpell.deleteMany();
await prisma.characterItem.deleteMany();
// ... mais deletes
```

Se precisar limpar manualmente:

```bash
npm run prisma:migrate reset
```

## Customizar o Seed

### Adicionar mais usuarios

Em `prisma/seed.ts`, adicione mais ao array:

```typescript
const users = await Promise.all([
  prisma.user.create({
    data: {
      name: 'Eve Martinez',
      email: 'eve@example.com',
      passwordHash, // ja reusamos o bcrypt
    },
  }),
  // ...
]);
```

### Adicionar mais spells

```typescript
const spells = await Promise.all([
  prisma.spellTemplate.create({
    data: {
      name: 'Meteor Swarm',
      level: 9,
      school: 'Evocation',
      // ... outros dados
    },
  }),
  // ...
]);
```

### Modificar personagens

```typescript
const characters = await Promise.all([
  prisma.character.create({
    data: {
      name: 'Seu Personagem',
      level: 10,
      hpCurrent: 80,
      hpMax: 80,
      // ... outros dados
    },
  }),
  // ...
]);
```

## Dados de Teste - Credenciais

### Usuarios Padroes

```
Email:    alice@example.com
Senha:    password123

Email:    bob@example.com
Senha:    password123

Email:    carol@example.com
Senha:    password123

Email:    david@example.com
Senha:    password123
```

### Campanha

```
Titulo:      The Lost Mines of Phandalin
Invite Code: CAMP1234
DM Type:     AI
```

### Personagens

```
1. Thordak Ironforge
   - Race: Dwarf
   - Class: Fighter
   - Level: 5
   - HP: 45/45

2. Liriel Moonwhisper
   - Race: Elf
   - Class: Wizard
   - Level: 5
   - HP: 28/28

3. Aramina Goldensong
   - Race: Human
   - Class: Cleric
   - Level: 5
   - HP: 34/34
```

## Troubleshooting

### Erro: "Relation does not exist"

Certifique-se de executar:
```bash
npm run prisma:migrate
```

Antes de executar:
```bash
npm run seed
```

### Erro: "No such file or directory"

Certifique-se de estar no diretorio raiz do projeto:
```bash
cd /home/gustavonunes/MestrIA
```

### Seed roda mas nao cria dados

Verifique se o PostgreSQL esta rodando:

```bash
# Docker
docker ps | grep postgres

# Local
psql -U postgres -c "SELECT 1;"
```

## Proximos Steps

1. Testar a API com os dados de seed
2. Verificar no Prisma Studio
3. Fazer requisicoes HTTP com os IDs dos usuarios/campanhas
4. Testar autenticacao com as credenciais

## Script Helpers

Adicione ao seu `.bashrc` ou `.zshrc`:

```bash
# Atalho para resetar banco e fazer seed
alias reset-db="npm run prisma:migrate reset && npm run seed"

# Atalho para abrir Prisma Studio
alias studio="npm run prisma:studio"

# Atalho para rodar dev
alias run="npm run dev:watch"
```

Entao pode usar:
```bash
reset-db  # Limpa e repovoar banco
studio    # Abre Prisma Studio
run       # Inicia servidor dev
```
