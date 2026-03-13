import { Response } from 'express';
import { CreateBotsUseCase, DeleteBotsByCampaignUseCase } from '@application/use-cases/BotUseCases';
import { ICharacterRepository } from '@domain/repositories/ICharacterRepository';
import { IRaceRepository } from '@domain/repositories/IRaceRepository';
import { IClassRepository } from '@domain/repositories/IClassRepository';
import { AppError } from '@shared/errors/AppError';
import { AuthRequest } from '@presentation/middlewares/authMiddleware';

export class BotController {
  private createBotsUseCase: CreateBotsUseCase;
  private deleteBotsUseCase: DeleteBotsByCampaignUseCase;

  constructor(
    characterRepo: ICharacterRepository,
    raceRepo: IRaceRepository,
    classRepo: IClassRepository,
  ) {
    this.createBotsUseCase = new CreateBotsUseCase(characterRepo, raceRepo, classRepo);
    this.deleteBotsUseCase = new DeleteBotsByCampaignUseCase(characterRepo);
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { campaignId, count, raceId, classId } = req.body;
      const result = await this.createBotsUseCase.execute(
        campaignId,
        req.userId,
        count,
        { raceId, classId },
      );

      res.status(201).json(result);
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
      const { campaignId } = req.params;

      await this.deleteBotsUseCase.execute(campaignId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    }
  }
}
