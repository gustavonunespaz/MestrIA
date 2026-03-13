import { aiService } from '@infrastructure/ai/AIService';
import { contextManagerService } from '@domain/services/ContextManagerService';
import { AppError } from '@shared/errors/AppError';

export interface GenerateAIResponseDTO {
  campaignId: string;
  characterId?: string | null;
  userMessage: string;
  type?: 'narrative' | 'combat-action' | 'evaluate-action' | null;
}

export interface AIResponseDTO {
  content: string;
  model: string;
  source: 'groq' | 'ollama';
  tokensUsed?: number;
  timestamp: string;
}

export class GenerateAIResponseUseCase {
  async execute(dto: GenerateAIResponseDTO): Promise<AIResponseDTO> {
    try {
      const systemPrompt = await contextManagerService.buildSystemPrompt(
        dto.campaignId,
      );

      const messageHistory = await contextManagerService.getRecentMessages(
        dto.campaignId,
        5,
      );

      let campaignContext;
      let characterContext;

      try {
        campaignContext = await contextManagerService.getCampaignContext(
          dto.campaignId,
        );
      } catch (error) {
        console.warn('Could not fetch campaign context:', error);
      }

      if (dto.characterId) {
        try {
          characterContext = await contextManagerService.getCharacterContext(
            dto.characterId,
          );
        } catch (error) {
          console.warn('Could not fetch character context:', error);
        }
      }

      const aiResponse = await aiService.generateDMResponse({
        systemMessage: systemPrompt,
        userMessage: dto.userMessage,
        campaignContext: campaignContext as Record<string, any>,
        characterContext: characterContext as Record<string, any>,
        messageHistory,
      });

      return {
        content: aiResponse.content,
        model: aiResponse.model,
        source: aiResponse.source,
        tokensUsed: aiResponse.tokensUsed,
        timestamp: aiResponse.timestamp.toISOString(),
      };
    } catch (error) {
      console.error('[GenerateAIResponseUseCase] Error:', error);
      throw new AppError(
        'Failed to generate AI response. ' + (error as Error).message,
        500,
      );
    }
  }

  getCircuitBreakerStatus() {
    return aiService.getCircuitBreakerStatus();
  }

  resetCircuitBreakers() {
    aiService.resetCircuitBreakers();
  }
}
