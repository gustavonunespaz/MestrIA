import { Response } from 'express';
import {
  CreateRaceUseCase,
  GetRaceByIdUseCase,
  UpdateRaceUseCase,
  DeleteRaceUseCase,
  ListAllRacesUseCase,
} from '@application/use-cases/RaceUseCases';
import { CreateRaceDTO, UpdateRaceDTO } from '@application/dto/RaceDTO';
import { IRaceRepository } from '@domain/repositories/IRaceRepository';
import { AppError } from '@shared/errors/AppError';
import { AuthRequest } from '@presentation/middlewares/authMiddleware';

export class RaceController {
  private createRaceUseCase: CreateRaceUseCase;
  private getRaceByIdUseCase: GetRaceByIdUseCase;
  private updateRaceUseCase: UpdateRaceUseCase;
  private deleteRaceUseCase: DeleteRaceUseCase;
  private listAllRacesUseCase: ListAllRacesUseCase;

  constructor(raceRepository: IRaceRepository) {
    this.createRaceUseCase = new CreateRaceUseCase(raceRepository);
    this.getRaceByIdUseCase = new GetRaceByIdUseCase(raceRepository);
    this.updateRaceUseCase = new UpdateRaceUseCase(raceRepository);
    this.deleteRaceUseCase = new DeleteRaceUseCase(raceRepository);
    this.listAllRacesUseCase = new ListAllRacesUseCase(raceRepository);
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, description, traits } = req.body;

      const dto = new CreateRaceDTO({
        name,
        description,
        traits,
      });

      const result = await this.createRaceUseCase.execute(dto);

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

      const result = await this.getRaceByIdUseCase.execute(id);

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
      const { name, description, traits } = req.body;

      const dto = new UpdateRaceDTO({
        name,
        description,
        traits,
      });

      const result = await this.updateRaceUseCase.execute(id, dto);

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

      await this.deleteRaceUseCase.execute(id);

      res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    }
  }

  async list(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await this.listAllRacesUseCase.execute();

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
