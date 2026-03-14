import { Response } from 'express';
import {
  CreateCampaignUseCase,
  GetCampaignByIdUseCase,
  UpdateCampaignUseCase,
  DeleteCampaignUseCase,
  ListCampaignsByUserUseCase,
  JoinCampaignByCodeUseCase,
} from '@application/use-cases/CampaignUseCases';
import { CreateCampaignDTO, UpdateCampaignDTO } from '@application/dto/CampaignDTO';
import { ICampaignRepository } from '@domain/repositories/ICampaignRepository';
import { AppError } from '@shared/errors/AppError';
import { AuthRequest } from '@presentation/middlewares/authMiddleware';

export class CampaignController {
  private createCampaignUseCase: CreateCampaignUseCase;
  private getCampaignByIdUseCase: GetCampaignByIdUseCase;
  private updateCampaignUseCase: UpdateCampaignUseCase;
  private deleteCampaignUseCase: DeleteCampaignUseCase;
  private listCampaignsByUserUseCase: ListCampaignsByUserUseCase;
  private joinCampaignByCodeUseCase: JoinCampaignByCodeUseCase;

  constructor(campaignRepository: ICampaignRepository) {
    this.createCampaignUseCase = new CreateCampaignUseCase(campaignRepository);
    this.getCampaignByIdUseCase = new GetCampaignByIdUseCase(campaignRepository);
    this.updateCampaignUseCase = new UpdateCampaignUseCase(campaignRepository);
    this.deleteCampaignUseCase = new DeleteCampaignUseCase(campaignRepository);
    this.listCampaignsByUserUseCase = new ListCampaignsByUserUseCase(campaignRepository);
    this.joinCampaignByCodeUseCase = new JoinCampaignByCodeUseCase(campaignRepository);
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { title, description, systemBase, dmType } = req.body;

      const dto = new CreateCampaignDTO({
        title,
        description,
        systemBase,
        dmType,
      });

      const result = await this.createCampaignUseCase.execute(req.userId, dto);

      res.status(201).json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const result = await this.getCampaignByIdUseCase.execute(id);

      res.json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, description, systemBase } = req.body;

      const dto = new UpdateCampaignDTO({
        title,
        description,
        systemBase,
      });

      const result = await this.updateCampaignUseCase.execute(id, dto);

      res.json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!req.userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      await this.deleteCampaignUseCase.execute(id, req.userId);

      res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    }
  }

  async listByCreator(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const result = await this.listCampaignsByUserUseCase.execute(req.userId);

      res.json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    }
  }

  async joinByCode(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { inviteCode } = req.body;
      const result = await this.joinCampaignByCodeUseCase.execute(req.userId, inviteCode);

      res.json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    }
  }
}
