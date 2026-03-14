import { Request, Response } from 'express';
import { GenerateAIResponseUseCase } from '@application/use-cases/AIUseCases';
import { AppError } from '@shared/errors/AppError';

export class AIController {
  private generateAIResponseUseCase: GenerateAIResponseUseCase;

  constructor() {
    this.generateAIResponseUseCase = new GenerateAIResponseUseCase();
  }

  async generateResponse(req: Request, res: Response): Promise<void> {
    try {
      const { campaignId, characterId, message, type } = req.body;

      if (!campaignId || !message) {
        throw new AppError(
          'Missing required fields: campaignId, message',
          400,
        );
      }

      const result = await this.generateAIResponseUseCase.execute({
        campaignId,
        characterId,
        userMessage: message,
        type: type || 'narrative',
      });

      res.json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        console.error('[AIController] Error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getCircuitBreakerStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = this.generateAIResponseUseCase.getCircuitBreakerStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async resetCircuitBreakers(req: Request, res: Response): Promise<void> {
    try {
      this.generateAIResponseUseCase.resetCircuitBreakers();
      res.json({ message: 'Circuit breakers reset successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const status = await this.generateAIResponseUseCase.healthCheck();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
