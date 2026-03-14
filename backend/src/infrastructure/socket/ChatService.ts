import { Server as SocketIOServer, Socket } from 'socket.io';
import { prisma } from '@infrastructure/prisma/client';
import { StringUtils, DateUtils } from '@shared/utils';

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  campaignId: string;
  senderRole: 'USER' | 'AI_DM' | 'HUMAN_DM' | 'SYSTEM';
  createdAt: Date;
}

export class ChatService {
  private io: SocketIOServer;
  private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds[]
  private campaignRooms: Map<string, Set<string>> = new Map(); // campaignId -> socketIds

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`[Chat] User connected: ${socket.id}`);

      // Usuário se conecta a uma campanha
      socket.on('join-campaign', (data: { campaignId: string; userId: string }) => {
        const { campaignId, userId } = data;
        
        // Registrar socket do usuário
        const userSockets = this.userSockets.get(userId) || [];
        userSockets.push(socket.id);
        this.userSockets.set(userId, userSockets);

        // Juntar à sala da campanha
        socket.join(`campaign:${campaignId}`);

        // Registrar na campanha
        if (!this.campaignRooms.has(campaignId)) {
          this.campaignRooms.set(campaignId, new Set());
        }
        this.campaignRooms.get(campaignId)!.add(socket.id);

        // Notificar outros
        this.io.to(`campaign:${campaignId}`).emit('user-joined', {
          userId,
          socketId: socket.id,
          timestamp: DateUtils.now(),
        });

        console.log(`[Chat] User ${userId} joined campaign ${campaignId}`);
      });

      // Mensagem do chat
      socket.on('send-message', async (data: any) => {
        const { campaignId, userId, senderRole, content } = data;

        try {
          // Validar conteúdo
          if (!content || content.trim().length === 0) {
            socket.emit('message-error', { error: 'Mensagem vazia' });
            return;
          }

          if (content.length > 1000) {
            socket.emit('message-error', { error: 'Mensagem muito longa (max 1000 caracteres)' });
            return;
          }

          // Persistir no banco
          const message = await prisma.message.create({
            data: {
              id: StringUtils.generateId(),
              content,
              senderId: userId,
              campaignId,
              senderRole,
            },
          });

          // Broadcast para a campanha
          this.io.to(`campaign:${campaignId}`).emit('new-message', {
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            senderRole: message.senderRole,
            campaignId: message.campaignId,
            createdAt: message.createdAt,
          });

          console.log(`[Chat] Message from ${userId} in campaign ${campaignId}`);
        } catch (error) {
          console.error('[Chat] Error saving message:', error);
          socket.emit('message-error', { error: 'Erro ao salvar mensagem' });
        }
      });

      // Typing indicator
      socket.on('user-typing', (data: { campaignId: string; userId: string }) => {
        const { campaignId, userId } = data;
        this.io.to(`campaign:${campaignId}`).emit('user-typing', {
          userId,
          timestamp: DateUtils.now(),
        });
      });

      // Deixar de digitar
      socket.on('user-stop-typing', (data: { campaignId: string; userId: string }) => {
        const { campaignId, userId } = data;
        this.io.to(`campaign:${campaignId}`).emit('user-stop-typing', {
          userId,
        });
      });

      // Desconectar
      socket.on('disconnect', () => {
        console.log(`[Chat] User disconnected: ${socket.id}`);

        // Remover dos mapping
        for (const [userId, sockets] of this.userSockets.entries()) {
          const index = sockets.indexOf(socket.id);
          if (index > -1) {
            sockets.splice(index, 1);
            if (sockets.length === 0) {
              this.userSockets.delete(userId);
            }

            // Notificar saída do usuário
            for (const [campaignId, campaignSockets] of this.campaignRooms.entries()) {
              if (campaignSockets.has(socket.id)) {
                this.io.to(`campaign:${campaignId}`).emit('user-left', {
                  userId,
                  timestamp: DateUtils.now(),
                });
                campaignSockets.delete(socket.id);
              }
            }
            break;
          }
        }
      });

      // Health check
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: DateUtils.now() });
      });
    });
  }

  // Enviar mensagem de sistema
  async sendSystemMessage(campaignId: string, content: string): Promise<void> {
    const message = await prisma.message.create({
      data: {
        id: StringUtils.generateId(),
        content,
        senderId: 'system',
        campaignId,
        senderRole: 'SYSTEM',
      },
    });

    this.io.to(`campaign:${campaignId}`).emit('new-message', {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderRole: message.senderRole,
      campaignId: message.campaignId,
      createdAt: message.createdAt,
    });
  }

  // Obter mensagens da campanha
  async getCampaignMessages(campaignId: string, limit: number = 50): Promise<ChatMessage[]> {
    const messages = await prisma.message.findMany({
      where: { campaignId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return messages.reverse().map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      campaignId: msg.campaignId,
      senderRole: msg.senderRole as any,
      createdAt: msg.createdAt,
    }));
  }

  // Limpar mensagens da campanha (admin)
  async clearCampaignMessages(campaignId: string): Promise<void> {
    await prisma.message.deleteMany({
      where: { campaignId },
    });

    this.io.to(`campaign:${campaignId}`).emit('chat-cleared', {
      campaignId,
      timestamp: DateUtils.now(),
    });
  }

  broadcastMapUpdate(campaignId: string, payload: Record<string, any>): void {
    this.io.to(`campaign:${campaignId}`).emit('map-updated', {
      campaignId,
      payload,
      timestamp: DateUtils.now(),
    });
  }
}
