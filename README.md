# MestrIA

Plataforma web de RPG de mesa com backend Node.js/TypeScript, banco PostgreSQL via Prisma e integracoes com LLMs.

## Como subir o ambiente

Use o guia completo em `SETUP.md`.

Observacao: o Docker Compose aguarda a API ficar saudavel antes de iniciar o frontend.

## Servicos

- Frontend: http://localhost:5173
- API: http://localhost:3000
- Ollama: http://localhost:11434
- Postgres (host): localhost:5433

## Estrutura (resumo)

- `backend/`: API Node.js + Prisma
- `frontend/`: Vite + React
- `docker-compose.yml`: orquestracao local

## Seeds (dados iniciais)

Para popular o banco com dados de teste (sem criar usuarios):

```bash
docker compose exec api npm run seed
```

Observacao: o seed usa usuarios existentes para montar campanhas e personagens. Se nao houver nenhum usuario, ele cria apenas dados que nao dependem de usuarios.

## DBeaver (conectar no banco)

Depois de subir o docker, conecte o DBeaver usando:

- Driver: PostgreSQL
- Host: `localhost`
- Porta: `5433`
- Banco: `mestria`
- Usuario: `postgres`
- Senha: `mestria`
