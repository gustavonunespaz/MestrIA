import { Router } from 'express';
import { CharacterController } from '@presentation/controllers/CharacterController';
import { CharacterRepository } from '@infrastructure/prisma/repositories/CharacterRepository';
import { authMiddleware } from '@presentation/middlewares/authMiddleware';

const router = Router();
const characterRepository = new CharacterRepository();
const characterController = new CharacterController(characterRepository);

// Routes - Todas require autenticação
router.post('/', authMiddleware, (req, res) =>
  characterController.create(req, res),
);
router.get('/campaign/list', authMiddleware, (req, res) =>
  characterController.listByCampaign(req, res),
);
router.get('/user/list', authMiddleware, (req, res) =>
  characterController.listByUser(req, res),
);
router.get('/:id', authMiddleware, (req, res) =>
  characterController.getById(req, res),
);
router.put('/:id', authMiddleware, (req, res) =>
  characterController.update(req, res),
);
router.delete('/:id', authMiddleware, (req, res) =>
  characterController.delete(req, res),
);

export { router as characterRoutes };
