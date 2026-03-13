import { Router, Request, Response } from 'express';
import { CombatService } from '@infrastructure/services/CombatService';
import { ChatService } from '@infrastructure/socket/ChatService';

// Será injetado como middleware
let combatService: CombatService;

export interface AuthRequest extends Request {
  userId?: string;
  email?: string;
}

export function setCombatService(service: CombatService): void {
  combatService = service;
}

export const combatRoutes = Router();

/**
 * POST /api/combat/start
 * Iniciar um novo combate
 */
combatRoutes.post('/start', async (req: AuthRequest, res: Response) => {
  try {
    const { campaignId, encounterId, playerCharacterIds, monsterIds } = req.body;

    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (!campaignId || !encounterId) {
      return res.status(400).json({ error: 'campaignId e encounterId são obrigatórios' });
    }

    if (!Array.isArray(playerCharacterIds) || !Array.isArray(monsterIds)) {
      return res.status(400).json({ error: 'playerCharacterIds e monsterIds devem ser arrays' });
    }

    if (!combatService) {
      return res.status(500).json({ error: 'Combat service não inicializado' });
    }

    const encounter = await combatService.startEncounter(
      campaignId,
      encounterId,
      playerCharacterIds,
      monsterIds,
    );

    res.json({
      success: true,
      encounterId,
      currentTurn: encounter.getCurrentTurn(),
      round: encounter.getRound(),
      participants: encounter.getAllParticipants(),
    });
  } catch (error) {
    console.error('[CombatController] Error starting encounter:', error);
    res.status(500).json({ error: 'Erro ao iniciar combate' });
  }
});

/**
 * GET /api/combat/:encounterId/state
 * Obter estado atual do combate
 */
combatRoutes.get('/:encounterId/state', async (req: AuthRequest, res: Response) => {
  try {
    const { encounterId } = req.params;
    const { campaignId } = req.query;

    if (!campaignId) {
      return res.status(400).json({ error: 'campaignId é obrigatório' });
    }

    if (!combatService) {
      return res.status(500).json({ error: 'Combat service não inicializado' });
    }

    const encounter = combatService.getActiveCombat(campaignId as string, encounterId);

    if (!encounter) {
      return res.status(404).json({ error: 'Combate não encontrado' });
    }

    res.json({
      encounterId,
      round: encounter.getRound(),
      currentTurn: encounter.getCurrentTurn(),
      participants: encounter.getAllParticipants(),
    });
  } catch (error) {
    console.error('[CombatController] Error getting combat state:', error);
    res.status(500).json({ error: 'Erro ao obter estado do combate' });
  }
});

/**
 * POST /api/combat/:encounterId/action
 * Executar uma ação em combate
 */
combatRoutes.post('/:encounterId/action', async (req: AuthRequest, res: Response) => {
  try {
    const { encounterId } = req.params;
    const { campaignId, participantId, action, targetId, spellName } = req.body;

    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (!campaignId) {
      return res.status(400).json({ error: 'campaignId é obrigatório' });
    }

    if (!action) {
      return res.status(400).json({ error: 'action é obrigatório' });
    }

    if (!['attack', 'spell', 'move', 'dodge', 'help'].includes(action)) {
      return res.status(400).json({ error: 'Ação inválida' });
    }

    if (!combatService) {
      return res.status(500).json({ error: 'Combat service não inicializado' });
    }

    const result = await combatService.takeAction(
      campaignId,
      encounterId,
      participantId,
      action as any,
      targetId,
      spellName,
    );

    res.json({
      success: true,
      action,
      result,
    });
  } catch (error) {
    console.error('[CombatController] Error taking action:', error);
    res.status(500).json({ error: `Erro ao executar ação: ${(error as Error).message}` });
  }
});

/**
 * POST /api/combat/:encounterId/end
 * Terminar o combate
 */
combatRoutes.post('/:encounterId/end', async (req: AuthRequest, res: Response) => {
  try {
    const { encounterId } = req.params;
    const { campaignId } = req.body;

    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (!campaignId) {
      return res.status(400).json({ error: 'campaignId é obrigatório' });
    }

    if (!combatService) {
      return res.status(500).json({ error: 'Combat service não inicializado' });
    }

    await combatService.endEncounter(campaignId, encounterId);

    res.json({
      success: true,
      message: 'Combate finalizado',
    });
  } catch (error) {
    console.error('[CombatController] Error ending encounter:', error);
    res.status(500).json({ error: 'Erro ao finalizar combate' });
  }
});

/**
 * POST /api/combat/dice/roll
 * Rolar dados (endpoint público)
 */
combatRoutes.post('/dice/roll', async (req: AuthRequest, res: Response) => {
  try {
    const { expression, advantage, disadvantage } = req.body;

    if (!expression) {
      return res.status(400).json({ error: 'expression é obrigatório' });
    }

    const { DiceRoller } = await import('@shared/utils/DiceRoller');
    const result = DiceRoller.roll(expression, { advantage, disadvantage });

    res.json(result);
  } catch (error) {
    console.error('[CombatController] Error rolling dice:', error);
    res.status(400).json({ error: `Erro ao rolar dados: ${(error as Error).message}` });
  }
});
