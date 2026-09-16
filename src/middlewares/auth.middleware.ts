import { Request, Response, NextFunction } from 'express';
import { authService, JwtPayload } from '../services/auth.service.js';
import { AppError } from '../utils/appError.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Se requiere autenticación. Proporcione un token Bearer');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw AppError.unauthorized('Token no proporcionado');
    }

    const decoded = authService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
