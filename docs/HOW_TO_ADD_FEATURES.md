# Guia: Como Adicionar uma Nova Feature

Este documento descreve o passo a passo para adicionar uma nova feature seguindo a arquitetura limpa.

## Exemplo: Adicionar Feature de Campanhas

### Passo 1: Criar Entidade (Domain/Entities)

```typescript
// src/domain/entities/Campaign.ts
export interface ICampaign {
  id: string;
  title: string;
  description: string;
  systemBase: string;
  dmType: 'AI' | 'HUMAN';
  creatorId: string;
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Campaign implements ICampaign {
  id: string;
  title: string;
  description: string;
  systemBase: string;
  dmType: 'AI' | 'HUMAN';
  creatorId: string;
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: ICampaign) {
    Object.assign(this, props);
  }
}
```

### Passo 2: Criar Interface do Repositório (Domain/Repositories)

```typescript
// src/domain/repositories/ICampaignRepository.ts
import { Campaign } from '../entities/Campaign';

export interface ICampaignRepository {
  findById(id: string): Promise<Campaign | null>;
  findAll(): Promise<Campaign[]>;
  create(campaign: Campaign): Promise<Campaign>;
  update(campaign: Campaign): Promise<Campaign>;
  delete(id: string): Promise<void>;
}
```

### Passo 3: Implementar Repositório (Infrastructure/Prisma/Repositories)

```typescript
// src/infrastructure/prisma/repositories/CampaignRepository.ts
import { ICampaignRepository } from '@domain/repositories/ICampaignRepository';
import { Campaign } from '@domain/entities/Campaign';
import { prisma } from '@infrastructure/prisma/client';

export class CampaignRepository implements ICampaignRepository {
  async findById(id: string): Promise<Campaign | null> {
    const data = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!data) return null;

    return new Campaign({
      id: data.id,
      title: data.title,
      description: data.description ?? '',
      systemBase: data.systemBase,
      dmType: data.dmType as 'AI' | 'HUMAN',
      creatorId: data.creatorId,
      inviteCode: data.inviteCode ?? '',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async findAll(): Promise<Campaign[]> {
    const data = await prisma.campaign.findMany();
    return data.map(d => new Campaign({
      id: d.id,
      title: d.title,
      description: d.description ?? '',
      systemBase: d.systemBase,
      dmType: d.dmType as 'AI' | 'HUMAN',
      creatorId: d.creatorId,
      inviteCode: d.inviteCode ?? '',
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));
  }

  async create(campaign: Campaign): Promise<Campaign> {
    const created = await prisma.campaign.create({
      data: {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        systemBase: campaign.systemBase,
        dmType: campaign.dmType,
        creatorId: campaign.creatorId,
        inviteCode: campaign.inviteCode,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
      },
    });

    return new Campaign({
      id: created.id,
      title: created.title,
      description: created.description ?? '',
      systemBase: created.systemBase,
      dmType: created.dmType as 'AI' | 'HUMAN',
      creatorId: created.creatorId,
      inviteCode: created.inviteCode ?? '',
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  }

  async update(campaign: Campaign): Promise<Campaign> {
    const updated = await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        title: campaign.title,
        description: campaign.description,
        systemBase: campaign.systemBase,
        dmType: campaign.dmType,
        updatedAt: new Date(),
      },
    });

    return new Campaign({
      id: updated.id,
      title: updated.title,
      description: updated.description ?? '',
      systemBase: updated.systemBase,
      dmType: updated.dmType as 'AI' | 'HUMAN',
      creatorId: updated.creatorId,
      inviteCode: updated.inviteCode ?? '',
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.campaign.delete({
      where: { id },
    });
  }
}
```

### Passo 4: Criar DTOs (Application/DTO)

```typescript
// src/application/dto/CampaignDTO.ts
export class CreateCampaignDTO {
  title: string;
  description?: string;
  systemBase: string;
  dmType: 'AI' | 'HUMAN';
  creatorId: string;

  constructor(data: {
    title: string;
    description?: string;
    systemBase: string;
    dmType: 'AI' | 'HUMAN';
    creatorId: string;
  }) {
    Object.assign(this, data);
  }
}

export class CampaignResponseDTO {
  id: string;
  title: string;
  description?: string;
  systemBase: string;
  dmType: string;
  creatorId: string;
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: any) {
    Object.assign(this, data);
  }
}
```

### Passo 5: Criar Use Cases (Application/Use-Cases)

```typescript
// src/application/use-cases/CampaignUseCases.ts
import { ICampaignRepository } from '@domain/repositories/ICampaignRepository';
import { Campaign } from '@domain/entities/Campaign';
import { CreateCampaignDTO, CampaignResponseDTO } from '@application/dto/CampaignDTO';
import { StringUtils, DateUtils } from '@shared/utils';
import { ValidationError, NotFoundError } from '@shared/errors/AppError';

export class CreateCampaignUseCase {
  constructor(private campaignRepository: ICampaignRepository) {}

  async execute(dto: CreateCampaignDTO): Promise<CampaignResponseDTO> {
    if (!dto.title) {
      throw new ValidationError('Campaign title is required');
    }

    const campaign = new Campaign({
      id: StringUtils.generateId(),
      title: dto.title,
      description: dto.description || '',
      systemBase: dto.systemBase,
      dmType: dto.dmType,
      creatorId: dto.creatorId,
      inviteCode: StringUtils.generateId(),
      createdAt: DateUtils.now(),
      updatedAt: DateUtils.now(),
    });

    const created = await this.campaignRepository.create(campaign);

    return new CampaignResponseDTO(created);
  }
}

export class GetCampaignUseCase {
  constructor(private campaignRepository: ICampaignRepository) {}

  async execute(id: string): Promise<CampaignResponseDTO> {
    const campaign = await this.campaignRepository.findById(id);

    if (!campaign) {
      throw new NotFoundError('Campaign');
    }

    return new CampaignResponseDTO(campaign);
  }
}
```

### Passo 6: Criar Controller (Presentation/Controllers)

```typescript
// src/presentation/controllers/CampaignController.ts
import { Request, Response } from 'express';
import { CreateCampaignUseCase, GetCampaignUseCase } from '@application/use-cases/CampaignUseCases';
import { CreateCampaignDTO } from '@application/dto/CampaignDTO';
import { ICampaignRepository } from '@domain/repositories/ICampaignRepository';
import { AppError } from '@shared/errors/AppError';

export class CampaignController {
  private createCampaignUseCase: CreateCampaignUseCase;
  private getCampaignUseCase: GetCampaignUseCase;

  constructor(campaignRepository: ICampaignRepository) {
    this.createCampaignUseCase = new CreateCampaignUseCase(campaignRepository);
    this.getCampaignUseCase = new GetCampaignUseCase(campaignRepository);
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, systemBase, dmType } = req.body;
      const creatorId = req.user?.id; // Virá do token JWT

      const dto = new CreateCampaignDTO({
        title,
        description,
        systemBase,
        dmType,
        creatorId,
      });

      const result = await this.createCampaignUseCase.execute(dto);

      res.status(201).json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const result = await this.getCampaignUseCase.execute(id);

      res.json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}
```

### Passo 7: Criar Rotas (Presentation/Routes)

```typescript
// src/presentation/routes/campaignRoutes.ts
import { Router } from 'express';
import { CampaignController } from '@presentation/controllers/CampaignController';
import { CampaignRepository } from '@infrastructure/prisma/repositories/CampaignRepository';

const router = Router();
const campaignRepository = new CampaignRepository();
const campaignController = new CampaignController(campaignRepository);

router.post('/', (req, res) => campaignController.create(req, res));
router.get('/:id', (req, res) => campaignController.getById(req, res));

export { router as campaignRoutes };
```

### Passo 8: Registrar Rotas no Server

```typescript
// src/infrastructure/http/server.ts
import { campaignRoutes } from '@presentation/routes/campaignRoutes';

// ... dentro da função createServer()
app.use('/api/campaigns', campaignRoutes);
```

## Fluxo de Dados

```
HTTP Request
    ↓
Controller (req/res)
    ↓
Use Case (executa lógica)
    ↓
Repositório (acessa dados)
    ↓
Banco de Dados
    ↓
Repositório (retorna entidade)
    ↓
Use Case (retorna DTO)
    ↓
Controller (serializa para JSON)
    ↓
HTTP Response
```

## Benefícios dessa Arquitetura

✅ **Testabilidade**: Cada camada pode ser testada isoladamente
✅ **Manutenibilidade**: Mudanças no banco de dados não afetam os cases de uso
✅ **Escalabilidade**: Fácil adicionar novos repositórios ou estratégias
✅ **Independência de Frameworks**: Lógica não acoplada ao Express
✅ **Reutilização**: Use cases podem ser usados por diferentes controllers

## Checklist para Nova Feature

- [ ] Entidade criada em `domain/entities/`
- [ ] Repositório interface em `domain/repositories/`
- [ ] Repositório implementação em `infrastructure/prisma/repositories/`
- [ ] DTOs criados em `application/dto/`
- [ ] Use cases criados em `application/use-cases/`
- [ ] Controller criado em `presentation/controllers/`
- [ ] Rotas criadas em `presentation/routes/`
- [ ] Rotas registradas em `src/infrastructure/http/server.ts`
- [ ] Schema Prisma atualizado (se nova tabela)
- [ ] Migration executada: `npm run prisma:migrate`
