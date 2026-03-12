import { Router } from 'express';
import { SessionController } from '@presentation/controllers/SessionController';
import { SessionRepository } from '@infrastructure/prisma/repositories/SessionRepository';
import { CharacterRepository } from '@infrastructure/prisma/repositories/CharacterRepository';
import { authMiddleware } from '@presentation/middlewares/authMiddleware';

const router = Router();
const sessionRepository = new SessionRepository();
const characterRepository = new CharacterRepository();
const sessionController = new SessionController(sessionRepository, characterRepository);

// POST /api/sessions - Criar nova sessão
router.post('/', authMiddleware, (req, res) => sessionController.create(req, res));

// GET /api/sessions/:id - Obter sessão por ID
router.get('/:id', authMiddleware, (req, res) => sessionController.getById(req, res));

// PUT /api/sessions/:id - Atualizar sessão
router.put('/:id', authMiddleware, (req, res) => sessionController.update(req, res));

// DELETE /api/sessions/:id - Deletar sessão
router.delete('/:id', authMiddleware, (req, res) => sessionController.delete(req, res));

// GET /api/sessions/campaign/:campaignId - Listar sessões de uma campanha
router.get('/campaign/:campaignId', authMiddleware, (req, res) =>
  sessionController.listByCampaign(req, res),
);

export { router as sessionRoutes };
