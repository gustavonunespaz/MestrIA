import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer as createHttpServer } from 'http';
import { userRoutes } from '../../presentation/routes/useRoutes';
import { campaignRoutes } from '../../presentation/routes/campaignRoutes';
import { characterRoutes } from '../../presentation/routes/characterRoutes';
import { aiRoutes } from '../../presentation/routes/aiRoutes';
import { messageRoutes, setChatService } from '../../presentation/routes/messageRoutes';
import { raceRoutes } from '../../presentation/routes/raceRoutes';
import { classRoutes } from '../../presentation/routes/classRoutes';
import { messageControllerRoutes } from '../../presentation/routes/messageControllerRoutes';
import { sessionRoutes } from '../../presentation/routes/sessionRoutes';
import { botRoutes } from '../../presentation/routes/botRoutes';
import { ChatService } from '../socket/ChatService';
import { combatRoutes, setCombatService } from '../../presentation/controllers/CombatController';
import { CombatService } from '../services/CombatService';

export function createServer(): express.Application & { io?: Server } {
  const app = express();
  const httpServer = createHttpServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  // Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check route
  app.get('/health', (req: express.Request, res: express.Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Socket.io Chat Service
  const chatService = new ChatService(io);
  setChatService(chatService);

  // Combat Service
  const combatServiceInstance = new CombatService(chatService);
  setCombatService(combatServiceInstance);

  // Routes
  app.use('/api/users', userRoutes);
  app.use('/api/campaigns', campaignRoutes);
  app.use('/api/characters', characterRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/messages/crud', messageControllerRoutes);
  app.use('/api/races', raceRoutes);
  app.use('/api/classes', classRoutes);
  app.use('/api/sessions', sessionRoutes);
  app.use('/api/combat', combatRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/bots', botRoutes);

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[ERROR]', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
    });
  });

  return Object.assign(app, { io, httpServer });
}
