import { Router, Request, Response } from 'express';
import { ChatService } from '@infrastructure/socket/ChatService';

// Será injetado pelo servidor
let chatService: ChatService;

export function setChatService(service: ChatService): void {
  chatService = service;
}

export const messageRoutes = Router();

// GET /api/messages/campaign/:campaignId - Obter histórico de chat
messageRoutes.get('/campaign/:campaignId', async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!chatService) {
      return res.status(500).json({ error: 'Chat service não inicializado' });
    }

    const messages = await chatService.getCampaignMessages(campaignId, limit);
    res.json({
      campaignId,
      total: messages.length,
      messages,
    });
  } catch (error) {
    console.error('[MessageController] Error getting messages:', error);
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});

// POST /api/messages/campaign/:campaignId/system - Enviar mensagem do sistema (admin)
messageRoutes.post('/campaign/:campaignId/system', async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Conteúdo é obrigatório' });
    }

    if (!chatService) {
      return res.status(500).json({ error: 'Chat service não inicializado' });
    }

    await chatService.sendSystemMessage(campaignId, content);
    res.json({ success: true, message: 'Mensagem de sistema enviada' });
  } catch (error) {
    console.error('[MessageController] Error sending system message:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

// DELETE /api/messages/campaign/:campaignId - Limpar chat (admin)
messageRoutes.delete('/campaign/:campaignId', async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;

    if (!chatService) {
      return res.status(500).json({ error: 'Chat service não inicializado' });
    }

    await chatService.clearCampaignMessages(campaignId);
    res.json({ success: true, message: 'Chat limpo' });
  } catch (error) {
    console.error('[MessageController] Error clearing chat:', error);
    res.status(500).json({ error: 'Erro ao limpar chat' });
  }
});
