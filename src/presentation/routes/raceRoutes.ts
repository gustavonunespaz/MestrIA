import { Router } from 'express';
import { RaceController } from '@presentation/controllers/RaceController';
import { RaceRepository } from '@infrastructure/prisma/repositories/RaceRepository';
import { authMiddleware } from '@presentation/middlewares/authMiddleware';

const router = Router();
const raceRepository = new RaceRepository();
const raceController = new RaceController(raceRepository);

// GET /api/races - Listar todas as raças
router.get('/', (_req, res) => raceController.list(_req, res));

// POST /api/races - Criar nova raça
router.post('/', authMiddleware, (req, res) => raceController.create(req, res));

// GET /api/races/:id - Obter raça por ID
router.get('/:id', (_req, res) => raceController.getById(_req, res));

// PUT /api/races/:id - Atualizar raça
router.put('/:id', authMiddleware, (req, res) => raceController.update(req, res));

// DELETE /api/races/:id - Deletar raça
router.delete('/:id', authMiddleware, (req, res) => raceController.delete(req, res));

export { router as raceRoutes };
