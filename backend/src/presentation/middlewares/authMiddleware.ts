import { Request, Response, NextFunction } from 'express';
import { JWTService } from '@infrastructure/auth/JWTService';
import { AppError } from '@shared/errors/AppError';

export interface AuthRequest extends Request {
  userId?: string | null;
  email?: string | null;
}

const jwtService = new JWTService();

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError('Token não fornecido', 401);
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer') {
      throw new AppError('Formato de token inválido', 401);
    }

    if (!token) {
      throw new AppError('Token não fornecido', 401);
    }

    const payload = jwtService.verifyToken(token);

    req.userId = payload.userId;
    req.email = payload.email;

    next();
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(401).json({ error: 'Não autorizado' });
    }
  }
};

export const optionalAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer === 'Bearer' && token) {
      const payload = jwtService.verifyToken(token);
      req.userId = payload.userId;
      req.email = payload.email;
    }

    next();
  } catch (error) {
    next();
  }
};
