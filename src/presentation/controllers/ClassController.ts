import { Response } from 'express';
import {
  CreateClassUseCase,
  GetClassByIdUseCase,
  UpdateClassUseCase,
  DeleteClassUseCase,
  ListAllClassesUseCase,
} from '@application/use-cases/ClassUseCases';
import { CreateClassDTO, UpdateClassDTO } from '@application/dto/ClassDTO';
import { IClassRepository } from '@domain/repositories/IClassRepository';
import { AppError } from '@shared/errors/AppError';
import { AuthRequest } from '@presentation/middlewares/authMiddleware';

export class ClassController {
  private createClassUseCase: CreateClassUseCase;
  private getClassByIdUseCase: GetClassByIdUseCase;
  private updateClassUseCase: UpdateClassUseCase;
  private deleteClassUseCase: DeleteClassUseCase;
  private listAllClassesUseCase: ListAllClassesUseCase;

  constructor(classRepository: IClassRepository) {
    this.createClassUseCase = new CreateClassUseCase(classRepository);
    this.getClassByIdUseCase = new GetClassByIdUseCase(classRepository);
    this.updateClassUseCase = new UpdateClassUseCase(classRepository);
    this.deleteClassUseCase = new DeleteClassUseCase(classRepository);
    this.listAllClassesUseCase = new ListAllClassesUseCase(classRepository);
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, description, hitDice } = req.body;

      const dto = new CreateClassDTO({
        name,
        description,
        hitDice,
      });

      const result = await this.createClassUseCase.execute(dto);

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

      const result = await this.getClassByIdUseCase.execute(id);

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
      const { name, description, hitDice } = req.body;

      const dto = new UpdateClassDTO({
        name,
        description,
        hitDice,
      });

      const result = await this.updateClassUseCase.execute(id, dto);

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

      await this.deleteClassUseCase.execute(id);

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
      const result = await this.listAllClassesUseCase.execute();

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
