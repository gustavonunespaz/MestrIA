# Como subir o MestrIA (Docker Compose)

Este documento e o passo a passo completo para subir o ambiente local usando Docker.

## Pre-requisitos

- Docker com o plugin `docker compose`
- Portas livres: 3000, 5173, 5433 e 11434

## Variaveis de ambiente

O backend usa o arquivo `backend/.env`. Este repositorio ja possui um arquivo pronto.
Se precisar recriar, use o modelo abaixo (o host do banco e o servico `postgres`):

```env
# Database
DATABASE_URL="postgresql://postgres:mestria@postgres:5432/mestria"

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=dev-secret-change-me
JWT_EXPIRATION=7d

# AI Services
GROQ_API_KEY=your-groq-api-key
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# Socket.io
SOCKET_IO_CORS_ORIGIN=http://localhost:5173
```

## Subir o ambiente

1. Subir containers

```bash
docker compose up -d
```

2. Rodar migracoes do banco (primeira vez e quando o schema mudar)

```bash
docker compose exec api sh -c "cd backend && npx prisma migrate dev --name init --skip-seed"
```

3. (Opcional) Popular dados iniciais

```bash
docker compose exec api sh -c "cd backend && npm run seed"
```

## Acessos

- Frontend: http://localhost:5173
- API: http://localhost:3000
- Ollama: http://localhost:11434
- Postgres (host): localhost:5433 (usuario `postgres`, senha `mestria`)

## Comandos uteis

```bash
# Status dos containers
docker compose ps

# Logs em tempo real
docker compose logs -f

# Derrubar tudo
docker compose down
```

## Troubleshooting

- Se a API nao subir, verifique os logs:
  `docker compose logs --tail=200 api`
- Se o banco estiver lento ou travado, reinicie o Postgres:
  `docker compose restart postgres`
- Se o Prisma pedir nome de migracao, use `--name init`.
