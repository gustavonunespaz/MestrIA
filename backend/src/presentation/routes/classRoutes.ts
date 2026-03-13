import { Router } from 'express';
import { ClassController } from '@presentation/controllers/ClassController';
import { ClassRepository } from '@infrastructure/prisma/repositories/ClassRepository';
import { authMiddleware } from '@presentation/middlewares/authMiddleware';

const router = Router();
const classRepository = new ClassRepository();
const classController = new ClassController(classRepository);

// GET /api/classes - Listar todas as classes
router.get('/', (_req, res) => classController.list(_req, res));

// POST /api/classes - Criar nova classe
router.post('/', authMiddleware, (req, res) => classController.create(req, res));

// GET /api/classes/:id - Obter classe por ID
router.get('/:id', (_req, res) => classController.getById(_req, res));

// PUT /api/classes/:id - Atualizar classe
router.put('/:id', authMiddleware, (req, res) => classController.update(req, res));

// DELETE /api/classes/:id - Deletar classe
router.delete('/:id', authMiddleware, (req, res) => classController.delete(req, res));

export { router as classRoutes };
