# MestrIA

Plataforma web de RPG de mesa com backend em Node.js/TypeScript, banco PostgreSQL via Prisma e arquitetura para integração com LLMs (IA como Mestre de Jogo).

## Status atual

- Schema final do banco aplicado em `prisma/schema.prisma`:
  - `PUBLIC_RACE`, `PUBLIC_CLASS`, `PUBLIC_ITEM_TEMPLATE`, `PUBLIC_SPELL_TEMPLATE`,
    `PUBLIC_MONSTER_TEMPLATE`, `PUBLIC_MONSTER`, `PUBLIC_SESSION`, `PUBLIC_MESSAGE`,
    `PUBLIC_COMBAT_ENCOUNTER`, `PUBLIC_MAP`, `PUBLIC_CAMPAIGN_MEMBER`,
    `PUBLIC_PLAYER_CHARACTER`, `PUBLIC_CHARACTER_ITEM`, `PUBLIC_CHARACTER_SPELL`.
- Enumes migrados: `DmType`, `SenderRole`, `SessionStatus`.
- Entidades e repositórios injetáveis criados em `src/domain` + `src/infrastructure/prisma`.
- Build TypeScript validado sem erros usando `npm run build`.
- Markdown de documentação movido para `docs/`.

## Estrutura principal

- `src/domain/entities`: modelos de domínio.
- `src/domain/repositories`: contratos de repositório (interfaces).
- `src/infrastructure/prisma/repositories`: implementação de repositories usando Prisma.
- `src/infrastructure/http/server.ts`: servidor API (Express/Fastify) já integrado.
- `prisma/schema.prisma`: definição de dados e migrações.
- `seed.ts`: seed inicial de dados.
- `docs/`: documentos de arquitetura, backlog e status.

## Como rodar

1. Instalar dependências:
   - `npm install`
2. Ajustar `.env` (PostgreSQL e API keys caso use Groq/Ollama).
3. Rodar migrações:
   - `npx prisma migrate dev --name init`
4. Seed:
   - `npm run seed`
5. Iniciar:
   - `npm run dev`

## Pipelines e comandos úteis

- Compilar: `npm run build`
- Testes: `npm test` (se presente)
- Lint: `npm run lint`
- Prisma Studio: `npx prisma studio`

## Documentação

- `docs/01-architecture.md`
- `docs/02-prisma-schema.md`
- `docs/03-phase-status.md`
- `docs/04-post-merge-checklist.md`

## Próximos passos (recomendados)

- Implementar casos de uso (use-cases / services) para as novas entidades.
- Criar controladores/rotas REST para `Session`, `Message`, `PlayerCharacter` etc.
- Integrar Socket.IO para troca em tempo real de mensagens e estado da campanha.
- Adicionar testes unitários e de integração para repositórios e controllers.

---

Made with ❤️ e LLM-friendly architecture.
****
