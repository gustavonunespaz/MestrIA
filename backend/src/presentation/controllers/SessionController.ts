import { Response } from 'express';
import {
  CreateSessionUseCase,
  GetSessionByIdUseCase,
  UpdateSessionUseCase,
  DeleteSessionUseCase,
  ListSessionsByCampaignUseCase,
} from '@application/use-cases/SessionUseCases';
import { CreateSessionDTO, UpdateSessionDTO } from '@application/dto/SessionDTO';
import { ISessionRepository } from '@domain/repositories/ISessionRepository';
import { ICharacterRepository } from '@domain/repositories/ICharacterRepository';
import { AppError } from '@shared/errors/AppError';
import { AuthRequest } from '@presentation/middlewares/authMiddleware';

export class SessionController {
  private createSessionUseCase: CreateSessionUseCase;
  private getSessionByIdUseCase: GetSessionByIdUseCase;
  private updateSessionUseCase: UpdateSessionUseCase;
  private deleteSessionUseCase: DeleteSessionUseCase;
  private listSessionsByCampaignUseCase: ListSessionsByCampaignUseCase;

  constructor(
    sessionRepository: ISessionRepository,
    characterRepository: ICharacterRepository,
  ) {
    this.createSessionUseCase = new CreateSessionUseCase(sessionRepository);
    this.getSessionByIdUseCase = new GetSessionByIdUseCase(sessionRepository);
    this.updateSessionUseCase = new UpdateSessionUseCase(
      sessionRepository,
      characterRepository,
    );
    this.deleteSessionUseCase = new DeleteSessionUseCase(sessionRepository);
    this.listSessionsByCampaignUseCase = new ListSessionsByCampaignUseCase(
      sessionRepository,
    );
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, scheduledFor, status, summary, campaignId } = req.body;

      const dto = new CreateSessionDTO({
        title,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
        status,
        summary,
        campaignId,
      });

      const result = await this.createSessionUseCase.execute(dto);

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

      const result = await this.getSessionByIdUseCase.execute(id);

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
      const { title, scheduledFor, status, summary } = req.body;

      const dto = new UpdateSessionDTO({
        title,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
        status,
        summary,
      });

      const result = await this.updateSessionUseCase.execute(id, dto);

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

      await this.deleteSessionUseCase.execute(id);

      res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    }
  }

  async listByCampaign(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { campaignId } = req.params;

      const result = await this.listSessionsByCampaignUseCase.execute(campaignId);

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
