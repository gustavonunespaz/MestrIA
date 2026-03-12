import { Router } from 'express';
import { CampaignController } from '@presentation/controllers/CampaignController';
import { CampaignRepository } from '@infrastructure/prisma/repositories/CampaignRepository';
import { authMiddleware } from '@presentation/middlewares/authMiddleware';

const router = Router();
const campaignRepository = new CampaignRepository();
const campaignController = new CampaignController(campaignRepository);

// Routes - Todas require autenticação
router.post('/', authMiddleware, (req, res) =>
  campaignController.create(req, res),
);
router.get('/list', authMiddleware, (req, res) =>
  campaignController.listByCreator(req, res),
);
router.get('/:id', authMiddleware, (req, res) =>
  campaignController.getById(req, res),
);
router.put('/:id', authMiddleware, (req, res) =>
  campaignController.update(req, res),
);
router.delete('/:id', authMiddleware, (req, res) =>
  campaignController.delete(req, res),
);

export { router as campaignRoutes };
