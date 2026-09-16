import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError.js';
import { env } from '../config/env.js';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Prisma unique constraint error
  if ('code' in err && (err as { code: string }).code === 'P2002') {
    res.status(409).json({
      success: false,
      message: 'Ya existe un registro con uno de los valores únicos proporcionados.',
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  console.error('💥 Unhandled Error:', err);

  res.status(500).json({
    success: false,
    message: 'Ha ocurrido un error interno en el servidor.',
    ...(env.NODE_ENV === 'development' && {
      error: err.message,
      stack: err.stack,
    }),
  });
};
