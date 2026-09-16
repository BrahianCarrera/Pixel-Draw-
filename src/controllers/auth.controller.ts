import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { sendCreated, sendSuccess } from '../utils/response.js';
import { AppError } from '../utils/appError.js';
import { RegisterInput, LoginInput } from '../schemas/auth.schema.js';

export const register = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.register(req.body);
    sendCreated(res, result, 'Usuario registrado e identificado con éxito');
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.login(req.body);
    sendSuccess(res, result, 'Inicio de sesión exitoso');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.id) {
      throw AppError.unauthorized('No autenticado');
    }
    const user = await authService.getMe(req.user.id);
    sendSuccess(res, user, 'Datos de usuario y perfil de pareja obtenidos con éxito');
  } catch (error) {
    next(error);
  }
};
