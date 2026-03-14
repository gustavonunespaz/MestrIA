import { Response } from 'express';
import { AuthRequest } from '@presentation/middlewares/authMiddleware';
import { ResetPartyStateUseCase } from '@application/use-cases/PartyUseCases';
import { ICampaignRepository } from '@domain/repositories/ICampaignRepository';
import { ICharacterRepository } from '@domain/repositories/ICharacterRepository';
import { IMapRepository } from '@domain/repositories/IMapRepository';
import { AppError } from '@shared/errors/AppError';
import { ChatService } from '@infrastructure/socket/ChatService';

export class PartyController {
  private resetPartyStateUseCase: ResetPartyStateUseCase;
  private chatService?: ChatService;

  constructor(
    campaignRepository: ICampaignRepository,
    characterRepository: ICharacterRepository,
    mapRepository: IMapRepository,
  ) {
    this.resetPartyStateUseCase = new ResetPartyStateUseCase(
      campaignRepository,
      characterRepository,
      mapRepository,
    );
  }

  setChatService(service: ChatService): void {
    this.chatService = service;
  }

  async resetPartyState(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { campaignId } = req.params;

      if (!req.userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const result = await this.resetPartyStateUseCase.execute(req.userId, campaignId);

      if (this.chatService) {
        await this.chatService.sendSystemMessage(
          campaignId,
          '🔄 Estado da party resetado. Voltamos ao inicio da aventura.',
        );
        if (result.mapReset) {
          this.chatService.broadcastMapUpdate(campaignId, { type: 'positions', positions: {} });
        }
      }

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erro ao resetar a party' });
      }
    }
  }
}
