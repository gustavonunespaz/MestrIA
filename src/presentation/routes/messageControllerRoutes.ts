import { Router } from 'express';
import { MessageController } from '../controllers/MessageController';
import { MessageRepository } from '../../infrastructure/prisma/repositories/MessageRepository';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const messageRepository = new MessageRepository();
const messageController = new MessageController(messageRepository);

// POST /api/messages - Criar nova mensagem
router.post('/', authMiddleware, (req, res) => messageController.create(req, res));

// GET /api/messages/:id - Obter mensagem por ID
router.get('/:id', authMiddleware, (req, res) => messageController.getById(req, res));

// PUT /api/messages/:id - Atualizar mensagem
router.put('/:id', authMiddleware, (req, res) => messageController.update(req, res));

// DELETE /api/messages/:id - Deletar mensagem
router.delete('/:id', authMiddleware, (req, res) => messageController.delete(req, res));

// GET /api/messages/campaign/:campaignId - Listar mensagens de uma campanha
router.get('/campaign/:campaignId', authMiddleware, (req, res) =>
  messageController.listByCampaign(req, res),
);

// DELETE /api/messages/campaign/:campaignId - Deletar todas as mensagens de uma campanha
router.delete('/campaign/:campaignId', authMiddleware, (req, res) =>
  messageController.deleteByCampaign(req, res),
);

export { router as messageControllerRoutes };
