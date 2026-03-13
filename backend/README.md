# 🧙 MestrIA

Plataforma web de RPG de mesa com backend Node.js/TypeScript, banco PostgreSQL via Prisma e integração com LLMs (IA como Mestre de Jogo).

---

## Stack

| Camada     | Tecnologia                        |
|------------|-----------------------------------|
| Frontend   | Vite + React + TypeScript         |
| Backend    | Node.js + Express + TypeScript    |
| Banco      | PostgreSQL 16 via Prisma ORM      |
| IA local   | Ollama                            |
| IA na nuvem| Groq API                          |
| Infra      | Docker Compose + WSL 2            |

---

## Setup

Consulte o **[guia completo de setup](docs/SETUP.md)** para instruções detalhadas.

### Resumo rápido

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp backend/.env.example backend/.env
# Edite backend/.env conforme necessário

# 3. Subir os containers
docker compose up -d

# 4. Rodar migrações
docker compose exec api npx prisma migrate dev
```

### Serviços disponíveis

| Serviço    | URL                     |
|------------|-------------------------|
| Frontend   | http://localhost:5173   |
| API        | http://localhost:3000   |
| Ollama     | http://localhost:11434  |

---

## Estrutura do projeto

```
MestrIA/
├── backend/          # API Node.js + Prisma
│   ├── src/
│   │   ├── domain/          # Entidades e interfaces de repositório
│   │   ├── infrastructure/  # Implementações Prisma + servidor HTTP
│   │   └── application/     # Use cases / services
│   └── prisma/              # Schema e migrações
├── frontend/         # Vite + React
├── docs/             # Documentação
└── docker-compose.yml
```

---

## Comandos úteis

```bash
# Derrubar containers
docker compose down

# Logs em tempo real
docker compose logs -f

# Prisma Studio (visualizador do banco)
docker compose exec api npx prisma studio

# Seed de dados iniciais
docker compose exec api npm run seed
```

---

Made with ❤️ e LLM-friendly architecture.
