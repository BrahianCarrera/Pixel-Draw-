import { Request, Response, NextFunction } from 'express';
import { coupleService } from '../services/couple.service.js';
import { sendCreated, sendSuccess } from '../utils/response.js';
import {
  CreateCoupleInput,
  JoinCoupleInput,
  LeaveCoupleInput,
} from '../schemas/couple.schema.js';

export const createCouple = async (
  req: Request<{}, {}, CreateCoupleInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const couple = await coupleService.createCouple(req.body.userId);
    sendCreated(res, couple, 'Pareja creada con éxito y código de invitación generado');
  } catch (error) {
    next(error);
  }
};

export const joinCouple = async (
  req: Request<{}, {}, JoinCoupleInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const couple = await coupleService.joinCouple(req.body.userId, req.body.inviteCode);
    sendSuccess(res, couple, 'Te has unido a la pareja exitosamente');
  } catch (error) {
    next(error);
  }
};

export const getCoupleById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const coupleId = Number(req.params.id);
    const couple = await coupleService.getCoupleById(coupleId);
    sendSuccess(res, couple, 'Pareja encontrada');
  } catch (error) {
    next(error);
  }
};

export const getCoupleByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = Number(req.params.userId);
    const couple = await coupleService.getCoupleByUserId(userId);
    sendSuccess(res, couple, 'Pareja del usuario obtenida correctamente');
  } catch (error) {
    next(error);
  }
};

export const getCoupleByInviteCode = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const code = String(req.params.code);
    const couple = await coupleService.getCoupleByInviteCode(code);
    sendSuccess(res, couple, 'Información del código de invitación encontrada');
  } catch (error) {
    next(error);
  }
};

export const regenerateInviteCode = async (
  req: Request<{ id: string }, {}, { userId: number }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const coupleId = Number(req.params.id);
    const couple = await coupleService.regenerateInviteCode(coupleId, req.body.userId);
    sendSuccess(res, couple, 'Nuevo código de invitación generado con éxito');
  } catch (error) {
    next(error);
  }
};

export const leaveCouple = async (
  req: Request<{}, {}, LeaveCoupleInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await coupleService.leaveCouple(req.body.userId);
    sendSuccess(res, result, result.message);
  } catch (error) {
    next(error);
  }
};
