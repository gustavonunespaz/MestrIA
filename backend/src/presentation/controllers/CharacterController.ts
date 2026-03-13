import { Response } from 'express';
import {
  CreateCharacterUseCase,
  GetCharacterByIdUseCase,
  UpdateCharacterUseCase,
  DeleteCharacterUseCase,
  ListCharactersByCampaignUseCase,
  ListCharactersByUserUseCase,
} from '@application/use-cases/CharacterUseCases';
import { CreateCharacterDTO, UpdateCharacterDTO } from '@application/dto/CharacterDTO';
import { ICharacterRepository } from '@domain/repositories/ICharacterRepository';
import { AppError } from '@shared/errors/AppError';
import { AuthRequest } from '@presentation/middlewares/authMiddleware';

export class CharacterController {
  private createCharacterUseCase: CreateCharacterUseCase;
  private getCharacterByIdUseCase: GetCharacterByIdUseCase;
  private updateCharacterUseCase: UpdateCharacterUseCase;
  private deleteCharacterUseCase: DeleteCharacterUseCase;
  private listCharactersByCampaignUseCase: ListCharactersByCampaignUseCase;
  private listCharactersByUserUseCase: ListCharactersByUserUseCase;

  constructor(characterRepository: ICharacterRepository) {
    this.createCharacterUseCase = new CreateCharacterUseCase(characterRepository);
    this.getCharacterByIdUseCase = new GetCharacterByIdUseCase(characterRepository);
    this.updateCharacterUseCase = new UpdateCharacterUseCase(characterRepository);
    this.deleteCharacterUseCase = new DeleteCharacterUseCase(characterRepository);
    this.listCharactersByCampaignUseCase = new ListCharactersByCampaignUseCase(
      characterRepository,
    );
    this.listCharactersByUserUseCase = new ListCharactersByUserUseCase(characterRepository);
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const {
        name,
        campaignId,
        raceId,
        classId,
        level,
        hpCurrent,
        hpMax,
        isBot,
        botType,
        attributes,
      } = req.body;

      const dto = new CreateCharacterDTO({
        name,
        campaignId,
        raceId,
        classId,
        level,
        hpCurrent,
        hpMax,
        isBot,
        botType,
        attributes,
      });

      const result = await this.createCharacterUseCase.execute(req.userId, dto);

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

      const result = await this.getCharacterByIdUseCase.execute(id);

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
      const { name, level, hpCurrent, hpMax, attributes, isBot, botType } = req.body;

      const dto = new UpdateCharacterDTO({
        name,
        level,
        hpCurrent,
        hpMax,
        attributes,
        // allow updates to bot flags if necessary
        ...(isBot !== undefined ? { isBot } : {}),
        ...(botType !== undefined ? { botType } : {}),
      });

      const result = await this.updateCharacterUseCase.execute(id, dto);

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

      await this.deleteCharacterUseCase.execute(id);

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
      const { campaignId } = req.query as { campaignId: string };

      const result = await this.listCharactersByCampaignUseCase.execute(campaignId);

      res.json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    }
  }

  async listByUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const result = await this.listCharactersByUserUseCase.execute(req.userId);

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
