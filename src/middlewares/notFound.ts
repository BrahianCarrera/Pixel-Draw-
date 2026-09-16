import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError.js';

export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  next(AppError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
};
