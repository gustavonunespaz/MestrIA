import { Router } from 'express';
import { BotController } from '@presentation/controllers/BotController';
import { CharacterRepository } from '@infrastructure/prisma/repositories/CharacterRepository';
import { RaceRepository } from '@infrastructure/prisma/repositories/RaceRepository';
import { ClassRepository } from '@infrastructure/prisma/repositories/ClassRepository';
import { authMiddleware } from '@presentation/middlewares/authMiddleware';

const router = Router();
const characterRepo = new CharacterRepository();
const raceRepo = new RaceRepository();
const classRepo = new ClassRepository();
const botController = new BotController(characterRepo, raceRepo, classRepo);

// POST /api/bots - criar bots (body: {campaignId, count})
router.post('/', authMiddleware, (req, res) => botController.create(req, res));

// DELETE /api/bots/:campaignId - apagar bots de uma campanha
router.delete('/:campaignId', authMiddleware, (req, res) => botController.delete(req, res));

export { router as botRoutes };
