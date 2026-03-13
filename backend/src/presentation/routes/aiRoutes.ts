import { Router } from 'express';
import { AIController } from '@presentation/controllers/AIController';

const router = Router();
const aiController = new AIController();

// Generate AI response for campaign
router.post('/generate', (req, res) => aiController.generateResponse(req, res));

// Get circuit breaker status
router.get('/circuit-breaker/status', (req, res) =>
  aiController.getCircuitBreakerStatus(req, res),
);

// Reset circuit breakers
router.post('/circuit-breaker/reset', (req, res) =>
  aiController.resetCircuitBreakers(req, res),
);

export { router as aiRoutes };
