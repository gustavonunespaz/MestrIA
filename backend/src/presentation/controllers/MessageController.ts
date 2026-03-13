import { Response } from 'express';
import {
  CreateMessageUseCase,
  GetMessageByIdUseCase,
  UpdateMessageUseCase,
  DeleteMessageUseCase,
  ListMessagesByCampaignUseCase,
  DeleteMessagesByCampaignUseCase,
} from '@application/use-cases/MessageUseCases';
import { CreateMessageDTO, UpdateMessageDTO } from '@application/dto/MessageDTO';
import { IMessageRepository } from '@domain/repositories/IMessageRepository';
import { AppError } from '@shared/errors/AppError';
import { AuthRequest } from '@presentation/middlewares/authMiddleware';

export class MessageController {
  private createMessageUseCase: CreateMessageUseCase;
  private getMessageByIdUseCase: GetMessageByIdUseCase;
  private updateMessageUseCase: UpdateMessageUseCase;
  private deleteMessageUseCase: DeleteMessageUseCase;
  private listMessagesByCampaignUseCase: ListMessagesByCampaignUseCase;
  private deleteMessagesByCampaignUseCase: DeleteMessagesByCampaignUseCase;

  constructor(messageRepository: IMessageRepository) {
    this.createMessageUseCase = new CreateMessageUseCase(messageRepository);
    this.getMessageByIdUseCase = new GetMessageByIdUseCase(messageRepository);
    this.updateMessageUseCase = new UpdateMessageUseCase(messageRepository);
    this.deleteMessageUseCase = new DeleteMessageUseCase(messageRepository);
    this.listMessagesByCampaignUseCase = new ListMessagesByCampaignUseCase(messageRepository);
    this.deleteMessagesByCampaignUseCase = new DeleteMessagesByCampaignUseCase(messageRepository);
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { content, campaignId, senderRole, diceRoll, isWhisper } = req.body;

      const dto = new CreateMessageDTO({
        content,
        senderId: req.userId,
        campaignId,
        senderRole,
        diceRoll,
        isWhisper: isWhisper || false,
      });

      const result = await this.createMessageUseCase.execute(dto);

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

      const result = await this.getMessageByIdUseCase.execute(id);

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
      const { content, diceRoll, isWhisper } = req.body;

      const dto = new UpdateMessageDTO({
        content,
        diceRoll,
        isWhisper,
      });

      const result = await this.updateMessageUseCase.execute(id, dto);

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

      await this.deleteMessageUseCase.execute(id);

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

      const result = await this.listMessagesByCampaignUseCase.execute(campaignId);

      res.json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    }
  }

  async deleteByCampaign(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { campaignId } = req.params;

      await this.deleteMessagesByCampaignUseCase.execute(campaignId);

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
