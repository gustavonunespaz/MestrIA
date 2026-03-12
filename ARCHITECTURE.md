# Arquitetura Limpa - MestrIA

## Visão Geral

Este projeto segue os princípios de **Arquitetura Limpa** (Clean Architecture) propostos por Robert C. Martin.

## As 4 Camadas Concêntricas

```
┌─────────────────────────────────────────────┐
│        PRESENTATION (Controllers)            │ 🖥️ Interface com o usuário
├─────────────────────────────────────────────┤
│        APPLICATION (Use Cases)                │ 📋 Lógica de aplicação
├─────────────────────────────────────────────┤
│        DOMAIN (Entities, Services)            │ 💼 Lógica de negócio pura
├─────────────────────────────────────────────┤
│   INFRASTRUCTURE (Prisma, APIs externas)    │ 🔧 Detalhes técnicos
└─────────────────────────────────────────────┘
```

## 1️⃣ DOMAIN LAYER (Camada de Domínio)

A camada mais interna e importante. Contém a **lógica de negócio pura**.

### Características:
- ✅ Sem dependências de frameworks
- ✅ Sem dependências de banco de dados
- ✅ Sem dependências HTTP
- ✅ Altamente testável

### Conteúdo:

**Entities** (`domain/entities/`)
- Classes que representam conceitos do negócio
- Contêm regras de validação de domínio
- Independentes de persistência

Exemplo:
```typescript
class Campaign {
  id: string;
  title: string;
  
  isValidTitle(): boolean {
    return this.title.length > 0;
  }
}
```

**Repositories** (`domain/repositories/`)
- **Interfaces** que definem contratos de acesso a dados
- Domain não sabe COMO os dados são persistidos
- Apenas define QUAL dado precisa

Exemplo:
```typescript
interface ICampaignRepository {
  findById(id: string): Promise<Campaign | null>;
  create(campaign: Campaign): Promise<Campaign>;
}
```

**Services** (`domain/services/`)
- Lógica de negócio que não pertence a uma entidade
- Orquestra múltiplas entidades
- Reutilizável em diferentes contextos

## 2️⃣ APPLICATION LAYER (Camada de Aplicação)

Orquestra as entidades do domínio para implementar **casos de uso**.

### Características:
- Implementa regras de aplicação
- Coordena entre entidades
- Valida dados de entrada
- Retorna respostas formatadas

### Conteúdo:

**DTOs** (`application/dto/`)
- Data Transfer Objects
- Transferem dados entre camadas
- Não exposição de detalhes internos

Exemplo:
```typescript
class CreateCampaignDTO {
  title: string;
  systemBase: string;
  dmType: 'AI' | 'HUMAN';
}
```

**Use Cases** (`application/use-cases/`)
- Um use case = Uma ação do usuário
- Coordena entidades e repositórios
- Implementa a lógica da aplicação

Exemplo:
```typescript
class CreateCampaignUseCase {
  constructor(private campaignRepository: ICampaignRepository) {}
  
  async execute(dto: CreateCampaignDTO): Promise<CampaignResponseDTO> {
    // Validação
    // Criar entidade
    // Persistir via repositório
    // Retornar DTO
  }
}
```

## 3️⃣ INFRASTRUCTURE LAYER (Camada de Infraestrutura)

Implementa as interfaces definidas no domínio e fornece acesso a recursos externos.

### Características:
- Conhece frameworks (Prisma, HTTP, etc)
- Implementa repositórios
- Gerencia conexões com serviços externos

### Conteúdo:

**Prisma** (`infrastructure/prisma/`)
- Cliente Prisma configurado
- Implementações concretas de repositórios
- Conhece detalhes do bando de dados

Exemplo:
```typescript
class UserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    const created = await prisma.user.create({
      data: { /* ... */ }
    });
    return new User(created);
  }
}
```

**HTTP Server** (`infrastructure/http/`)
- Configuração do Express
- Socket.io setup
- Middlewares globais

**AI** (`infrastructure/ai/`)
- Integração com Groq API
- Integração com Ollama
- Circuit Breaker logic

## 4️⃣ PRESENTATION LAYER (Camada de Apresentação)

A camada mais externa. Interface com o usuário.

### Características:
- Recebe requisições HTTP
- Chama use cases
- Retorna respostas JSON
- Não contém lógica de negócio

### Conteúdo:

**Controllers** (`presentation/controllers/`)
- Tratam requisições HTTP
- Chamam use cases
- Manipulam respostas/erros

Exemplo:
```typescript
class CampaignController {
  async create(req: Request, res: Response) {
    try {
      const dto = new CreateCampaignDTO(req.body);
      const result = await this.useCase.execute(dto);
      res.status(201).json(result);
    } catch (error) {
      res.status(error.statusCode).json({ error: error.message });
    }
  }
}
```

**Routes** (`presentation/routes/`)
- Definem endpoints
- Instanciam controllers
- Injetam dependências

Exemplo:
```typescript
const router = Router();
const repository = new UserRepository();
const useCase = new CreateUserUseCase(repository);
const controller = new UserController(useCase);

router.post('/', (req, res) => controller.create(req, res));
```

**Middlewares** (`presentation/middlewares/`)
- Autenticação
- Validação de entrada
- Error handling

## SHARED UTILITIES (Utilitários Compartilhados)

Funções e classes usadas em múltiplas camadas.

**Utils** (`shared/utils/`)
- StringUtils: Geração de IDs, truncagem
- DateUtils: Manipulação de datas
- ValidationUtils: Validações comuns

**Errors** (`shared/errors/`)
- AppError: Classe base de erros
- ValidationError, NotFoundError, etc
- Padronização de respostas de erro

## 🔄 Fluxo de Dados Completo

```
┌──────────────────────────────────┐
│     HTTP Request (POST)          │
│  /api/campaigns                  │
│  { title, systemBase, dmType }   │
└──────────────────┬───────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Express Router        │
        │ campaignRoutes        │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────────────┐
        │ CampaignController           │
        │ .create(req, res)            │
        │                              │
        │ - Parse request body         │
        │ - Validar básico             │
        │ - Criar DTO                  │
        └──────────┬───────────────────┘
                   │
                   ▼
        ┌──────────────────────────────────┐
        │ CreateCampaignUseCase            │
        │ .execute(dto)                    │
        │                                  │
        │ - Validar DTO completo          │
        │ - Criar entidade Campaign       │
        │ - Chamar repositório            │
        │ - Retornar DTO de resposta      │
        └──────────┬───────────────────────┘
                   │
                   ▼
        ┌──────────────────────────────────┐
        │ ICampaignRepository (Interface)  │
        │ (Contrato de acesso a dados)     │
        └──────────┬───────────────────────┘
                   │
                   ▼
        ┌──────────────────────────────────┐
        │ CampaignRepository               │
        │ .create(campaign)                │
        │                                  │
        │ - Converter entidade para schema │
        │ - Chamar Prisma                  │
        │ - Retornar entidade persistida   │
        └──────────┬───────────────────────┘
                   │
                   ▼
        ┌──────────────────────────────────┐
        │ Prisma Client                    │
        │ campaign.create()                │
        └──────────┬───────────────────────┘
                   │
                   ▼
        ┌──────────────────────────────────┐
        │ PostgreSQL Database              │
        │ INSERT INTO PUBLIC_CAMPAIGN ...  │
        └──────────┬───────────────────────┘
                   │
        ┌──────────▼───────────┐
        │ Resposta do BD       │
        │ { id, title, ... }   │
        └──────────┬───────────┘
                   │
                   ▼ (De volta subindo)
        (Use Case → Repository → Entity)
        │
        (Use Case → CampaignResponseDTO)
        │
        Controller → res.json(dto)
        │
        ▼
    HTTP Response 201
    { id, title, systemBase, dmType, ... }
```

## Inversão de Controle (IoC) / Injeção de Dependência

Para desacoplar as camadas, usamos **Injeção de Dependência**:

```typescript
// Ruim ❌ - Acoplamento forte
class CampaignController {
  private useCase = new CreateCampaignUseCase(
    new CampaignRepository()
  );
}

// Bom ✅ - Desacoplado
class CampaignController {
  constructor(private useCase: CreateCampaignUseCase) {}
}

// Uso
const repository = new CampaignRepository();
const useCase = new CreateCampaignUseCase(repository);
const controller = new CampaignController(useCase);
```

## Regras de Dependência

⚠️ **As dependências sempre apontam PARA DENTRO (para o domínio)**

```
Presentation → Application → Domain ← Infrastructure
                               ▲
                               │ implementa
                        (Interfaces)
```

- **Presentation** pode depender de Application e Domain
- **Application** pode depender de Domain (mas não de Presentation)
- **Domain** NÃO pode depender de nada
- **Infrastructure** implementa o Domain, não é dependência

## Testabilidade

Cada camada é testável isoladamente:

```typescript
// Teste de Domain (sem banco, sem HTTP)
const campaign = new Campaign({...});
expect(campaign.isValid()).toBe(true);

// Teste de Use Case (mockando repositório)
const mockRepository = mock(ICampaignRepository);
const useCase = new CreateCampaignUseCase(mockRepository);
const result = await useCase.execute(dto);

// Teste de Controller (mockando use case)
const mockUseCase = mock(CreateCampaignUseCase);
const controller = new CampaignController(mockUseCase);
await controller.create(req, res);
```

## Princípios Aplicados

✅ **SOLID**
- S: Single Responsibility - Cada classe tem uma responsabilidade
- O: Open/Closed - Aberto para extensão, fechado para modificação
- L: Liskov Substitution - Subclasses podem substituir a classe base
- I: Interface Segregation - Interfaces específicas, não genéricas
- D: Dependency Inversion - Depender de abstrações, não de implementações

✅ **DDD (Domain-Driven Design)**
- Focar na lógica de domínio
- Entidades como centro da arquitetura
- Linguagem ubíqua (mesmo vocabulário entre dev e negócio)

✅ **KISS (Keep It Simple, Stupid)**
- Simplicidade sobre complexidade
- Evitar over-engineering

## Evolução do Projeto

À medida que o projeto cresce:

1. **Hoje**: Estrutura básica com exemplos
2. **Próximo**: Adicionar Services de Domínio (CombatService, AIContextService)
3. **Depois**: Event Sourcing para auditoria
4. **Futura**: CQRS para separar leitura e escrita

---

**Referências:**
- Clean Architecture - Robert C. Martin
- Domain-Driven Design - Eric Evans
- Ports and Adapters - Alistair Cockburn
