import jwt, { SignOptions } from 'jsonwebtoken';
import { AppError } from '@shared/errors/AppError';

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export class JWTService {
  private readonly secretKey: string | Buffer;
  private readonly expiresIn: string = '24h';
  private readonly refreshExpiresIn: string = '7d';

  constructor(secretKey?: string) {
    this.secretKey = secretKey || process.env.JWT_SECRET || 'default-secret-key-change-in-production';
  }

  generateToken(userId: string, email: string): string {
    try {
      const payload: JWTPayload = {
        userId,
        email,
      };

      const token = jwt.sign(payload, this.secretKey, {
        expiresIn: this.expiresIn as any,
      });

      return token;
    } catch (error) {
      throw new AppError('Erro ao gerar token JWT', 500);
    }
  }

  generateRefreshToken(userId: string): string {
    try {
      const payload = {
        userId,
        type: 'refresh',
      };

      const token = jwt.sign(payload, this.secretKey, {
        expiresIn: this.refreshExpiresIn as any,
      });

      return token;
    } catch (error) {
      throw new AppError('Erro ao gerar refresh token', 500);
    }
  }

  verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.secretKey) as JWTPayload;
      return decoded;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Token expirado', 401);
      }
      if (error.name === 'JsonWebTokenError') {
        throw new AppError('Token inválido', 401);
      }
      throw new AppError('Erro ao verificar token', 401);
    }
  }

  verifyRefreshToken(token: string): { userId: string; type: string } {
    try {
      const decoded = jwt.verify(token, this.secretKey) as any;
      if (decoded.type !== 'refresh') {
        throw new Error('Token type inválido');
      }
      return decoded;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Refresh token expirado', 401);
      }
      throw new AppError('Refresh token inválido', 401);
    }
  }

  decodeToken(token: string): JWTPayload {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      if (!decoded) {
        throw new AppError('Erro ao decodificar token', 400);
      }
      return decoded;
    } catch (error) {
      throw new AppError('Erro ao decodificar token', 400);
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) {
        return true;
      }
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}
