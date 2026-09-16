import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';
import { sendCreated, sendSuccess } from '../utils/response.js';
import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema.js';

export const getUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await userService.getAllUsers();
    sendSuccess(res, users, 'Usuarios obtenidos correctamente');
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    const user = await userService.getUserById(userId);
    sendSuccess(res, user, 'Usuario encontrado');
  } catch (error) {
    next(error);
  }
};

export const createUser = async (
  req: Request<{}, {}, CreateUserInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const newUser = await userService.createUser(req.body);
    sendCreated(res, newUser, 'Usuario registrado con éxito');
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request<{ id: string }, {}, UpdateUserInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    const updatedUser = await userService.updateUser(userId, req.body);
    sendSuccess(res, updatedUser, 'Usuario actualizado con éxito');
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    await userService.deleteUser(userId);
    sendSuccess(res, { id: userId }, 'Usuario eliminado con éxito');
  } catch (error) {
    next(error);
  }
};
