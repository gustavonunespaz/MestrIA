import { Response } from 'express';
import { GetMapByCampaignUseCase, GenerateMapUseCase, UpdateMapUseCase } from '@application/use-cases/MapUseCases';
import { UpdateMapDTO } from '@application/dto/MapDTO';
import { IMapRepository } from '@domain/repositories/IMapRepository';
import { AppError } from '@shared/errors/AppError';
import { AuthRequest } from '@presentation/middlewares/authMiddleware';
import { ChatService } from '@infrastructure/socket/ChatService';

export class MapController {
  private getMapByCampaignUseCase: GetMapByCampaignUseCase;
  private generateMapUseCase: GenerateMapUseCase;
  private updateMapUseCase: UpdateMapUseCase;
  private chatService?: ChatService;

  constructor(mapRepository: IMapRepository) {
    this.getMapByCampaignUseCase = new GetMapByCampaignUseCase(mapRepository);
    this.generateMapUseCase = new GenerateMapUseCase(mapRepository);
    this.updateMapUseCase = new UpdateMapUseCase(mapRepository);
  }

  setChatService(service: ChatService) {
    this.chatService = service;
  }

  async getByCampaign(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { campaignId } = req.params;
      const result = await this.getMapByCampaignUseCase.execute(campaignId);
      if (!result) {
        res.status(404).json({ error: 'Mapa nao encontrado' });
        return;
      }
      res.json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    }
  }

  async generate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { campaignId } = req.params;
      const result = await this.generateMapUseCase.execute(campaignId);
      if (this.chatService) {
        this.chatService.broadcastMapUpdate(campaignId, { type: 'generated', map: result });
      }
      res.json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    }
  }

  async updatePositions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { campaignId } = req.params;
      const { positions } = req.body as { positions: Record<string, { x: number; y: number }> };

      if (!positions || typeof positions !== 'object') {
        res.status(400).json({ error: 'Posicoes invalidas' });
        return;
      }

      const result = await this.updateMapUseCase.execute(campaignId, new UpdateMapDTO({
        gridConfig: { positions },
      }));

      if (this.chatService) {
        this.chatService.broadcastMapUpdate(campaignId, { type: 'positions', positions, updatedBy: req.userId || null });
      }

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
