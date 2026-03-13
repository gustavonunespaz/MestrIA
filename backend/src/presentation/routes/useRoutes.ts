import { Router } from 'express';
import { UserController } from '@presentation/controllers/UserController';
import { UserRepository } from '@infrastructure/prisma/repositories/UserRepository';
import { authMiddleware } from '@presentation/middlewares/authMiddleware';

const router = Router();
const userRepository = new UserRepository();
const userController = new UserController(userRepository);

// Routes
router.post('/', (req, res) => userController.create(req, res));
router.post('/auth/login', (req, res) => userController.login(req, res));
router.get('/:id', authMiddleware, (req, res) => userController.getById(req, res));

export { router as userRoutes };
