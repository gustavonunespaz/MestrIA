# Como subir o MestrIA (Docker Compose)

Este documento e o passo a passo completo para subir o ambiente local usando Docker.

## Pre-requisitos

- Docker com o plugin `docker compose`
- Portas livres: 3000, 5173, 5433 e 11434

## Variaveis de ambiente

O backend usa o arquivo `backend/.env`. Este repositorio ja possui um arquivo pronto.
Se precisar recriar, use o modelo abaixo (o host do banco e o servico `postgres`).
Importante: mantenha `GROQ_API_KEY` privado.

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
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=llama3.2:1b

# Socket.io
SOCKET_IO_CORS_ORIGIN=http://localhost:5173
```

## Subir o ambiente

Subir tudo (backend, frontend, banco e IA):

```bash
docker compose up -d
```

Observacoes:
- Na primeira subida, o Ollama pode demorar para baixar o modelo.
- As migracoes rodam automaticamente no startup da API.

Opcional: popular dados iniciais

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
- Se voce alterar o schema, rode manualmente:
  `docker compose exec api sh -c "npx prisma migrate dev --name init --skip-seed"`
