import { Request, Response } from 'express';
import { CreateUserUseCase, GetUserByIdUseCase, LoginUseCase } from '@application/use-cases/UserUseCases';
import { CreateUserDTO, LoginDTO } from '@application/dto/UserDTO';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { AppError } from '@shared/errors/AppError';

// Controller - Presentation layer
export class UserController {
  private createUserUseCase: CreateUserUseCase;
  private getUserByIdUseCase: GetUserByIdUseCase;
  private loginUseCase: LoginUseCase;

  constructor(userRepository: IUserRepository) {
    this.createUserUseCase = new CreateUserUseCase(userRepository);
    this.getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
    this.loginUseCase = new LoginUseCase(userRepository);
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;

      const dto = new CreateUserDTO({
        name,
        email,
        password,
      });

      const result = await this.createUserUseCase.execute(dto);

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

      const result = await this.getUserByIdUseCase.execute(id);

      res.json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const dto = new LoginDTO({
        email,
        password,
      });

      const result = await this.loginUseCase.execute(dto);

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
