import { Router } from 'express';
import { PartyController } from '@presentation/controllers/PartyController';
import { CampaignRepository } from '@infrastructure/prisma/repositories/CampaignRepository';
import { CharacterRepository } from '@infrastructure/prisma/repositories/CharacterRepository';
import { MapRepository } from '@infrastructure/prisma/repositories/MapRepository';
import { authMiddleware } from '@presentation/middlewares/authMiddleware';
import { ChatService } from '@infrastructure/socket/ChatService';

const router = Router();

const partyController = new PartyController(
  new CampaignRepository(),
  new CharacterRepository(),
  new MapRepository(),
);

export function setPartyChatService(service: ChatService): void {
  partyController.setChatService(service);
}

router.post('/campaign/:campaignId/reset', authMiddleware, (req, res) =>
  partyController.resetPartyState(req, res),
);

export { router as partyRoutes };
