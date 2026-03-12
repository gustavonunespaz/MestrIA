# 🎭 MestrIA - Plataforma de RPG com IA

Uma plataforma web de RPG de mesa potencializada por Inteligência Artificial, onde a IA atua como Dungeon Master em campanhas multiplayer em tempo real.

## 📋 Pré-requisitos

- Node.js 18+ 
- Docker & Docker Compose (opcional, mas recomendado)
- PostgreSQL 16 (se não usar Docker)

## 🚀 Quick Start

### Opção 1: Com Docker (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/gustavonunespaz/MestrIA.git
cd MestrIA

# Copie as variáveis de ambiente
cp .env.example .env

# Inicie os serviços
docker-compose up -d

# Execute as migrations do Prisma
docker exec mestria-api npm run prisma:migrate

# Pronto! API rodando em http://localhost:3000
```

### Opção 2: Local

```bash
# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do PostgreSQL

# Generate Prisma client
npm run prisma:generate

# Execute as migrations
npm run prisma:migrate

# Inicie o servidor em desenvolvimento
npm run dev:watch
```

## 📁 Estrutura do Projeto

```
src/
├── domain/              # Camada de Domínio (Entidades, Interfaces de Repositórios)
│   ├── entities/        # Entidades de negócio
│   ├── repositories/    # Interfaces dos repositórios
│   └── services/        # Serviços de domínio
├── application/         # Camada de Aplicação (Use Cases, DTOs)
│   ├── dto/            # Data Transfer Objects
│   └── use-cases/      # Casos de uso
├── infrastructure/      # Camada de Infraestrutura
│   ├── prisma/         # Implementação do Prisma
│   │   └── repositories/ # Implementações concretas dos repositórios
│   ├── http/           # Configuração do servidor Express
│   └── ai/             # Integração com LLMs (Groq, Ollama)
├── presentation/        # Camada de Apresentação (Controllers, Routes)
│   ├── controllers/    # Controladores HTTP
│   ├── routes/         # Definição de rotas
│   └── middlewares/    # Middlewares do Express
├── shared/             # Utilitários compartilhados
│   ├── utils/         # Funções utilitárias
│   └── errors/        # Classes de erro customizadas
└── main.ts            # Entry point

prisma/
└── schema.prisma      # Schema do Prisma (modelo de dados)
```

## 🏗️ Arquitetura Limpa

O projeto segue os princípios de **Arquitetura Limpa**:

### Camadas:

1. **Domain** (Núcleo mais interno)
   - Contém entidades e regras de negócio pura
   - Independente de frameworks
   - Não conhece a origem dos dados

2. **Application**
   - Orquestra a lógica de domínio
   - Implementa casos de uso
   - Define DTOs para comunicação entre camadas

3. **Infrastructure**
   - Implementações concretas (banco de dados, APIs externas)
   - Prisma, Socket.io, integração com IA

4. **Presentation**
   - Controllers, Routes, Middlewares
   - Interface HTTP/REST
   - Desacoplado do domínio

### Exemplo: Criar um Usuário

```
HTTP Request (POST /api/users)
    ↓
UserController (Presentation)
    ↓
CreateUserUseCase (Application)
    ↓
IUserRepository (Domain - Interface)
    ↓
UserRepository (Infrastructure - Implementação)
    ↓
Prisma → PostgreSQL
```

## 🗄️ Banco de Dados

O schema PostgreSQL já está criado. Para sincronizar com Prisma:

```bash
npm run prisma:migrate
```

### Tabelas Principais:

- **User**: Usuários do sistema
- **Campaign**: Campanhas de RPG
- **Character**: Personagens dos jogadores
- **Message**: Histórico de chat
- **CombatEncounter**: Encounters de combate
- **Map**: Mapas da campanha
- **Monster/MonsterTemplate**: Monstros e templates

## 🤖 Integração com IA

O sistema usa **Circuit Breaker Pattern** com Fallback:

1. **Rota Principal**: Groq API (Open Source LLMs)
2. **Rota Secundária**: Ollama (local)

```
Request → Groq API
           ↓
         Se falhar → Ollama (localhost:11434)
```

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev:watch          # Inicia o servidor com hot reload
npm run dev               # Inicia o servidor uma única vez

# Build e Produção
npm run build             # Compila TypeScript para dist/
npm start                 # Inicia a aplicação compilada

# Prisma
npm run prisma:generate   # Regenera o cliente Prisma
npm run prisma:migrate    # Executa migrations
npm run prisma:studio     # Abre a interface visual do Prisma
```

## 🐳 Docker

### Serviços Inclusos:

- **postgres**: Banco de dados PostgreSQL
- **api**: API Node.js
- **ollama**: Servidor de IA local

```bash
# Visualizar logs
docker-compose logs -f api

# Parar os serviços
docker-compose down

# Remover volumes (limpar BD)
docker-compose down -v
```

## 🔐 Variáveis de Ambiente

Veja `.env.example` para referência:

```env
DATABASE_URL=postgresql://postgres:tdvlkw1!@localhost:5432/mestria
PORT=3000
NODE_ENV=development
JWT_SECRET=seu-secret-aqui
GROQ_API_KEY=sua-chave-groq
OLLAMA_URL=http://localhost:11434
SOCKET_IO_CORS_ORIGIN=http://localhost:5173
```

## 📚 Próximos Passos

- [ ] Implementar autenticação JWT
- [ ] Criar endpoints para campanhas
- [ ] Implementar WebSockets para chat em tempo real
- [ ] Integrar com Groq API
- [ ] Implementar sistema de combate
- [ ] Adicionar testes unitários e de integração

## 📄 Licença

ISC

## 👨‍💻 Desenvolvedor

Gustavo Nunes Paz (gustavonunespaz)
