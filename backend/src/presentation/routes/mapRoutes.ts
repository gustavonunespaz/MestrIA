import { Router } from 'express';
import { MapController } from '@presentation/controllers/MapController';
import { MapRepository } from '@infrastructure/prisma/repositories/MapRepository';
import { authMiddleware } from '@presentation/middlewares/authMiddleware';
import { ChatService } from '@infrastructure/socket/ChatService';

const router = Router();
const mapRepository = new MapRepository();
const mapController = new MapController(mapRepository);

export function setMapChatService(service: ChatService): void {
  mapController.setChatService(service);
}

router.get('/campaign/:campaignId', authMiddleware, (req, res) =>
  mapController.getByCampaign(req, res),
);

router.post('/campaign/:campaignId/generate', authMiddleware, (req, res) =>
  mapController.generate(req, res),
);

router.patch('/campaign/:campaignId/positions', authMiddleware, (req, res) =>
  mapController.updatePositions(req, res),
);

export { router as mapRoutes };
