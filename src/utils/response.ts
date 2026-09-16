import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: unknown;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
): Response => {
  const responsePayload: ApiResponse<T> = {
    success: true,
    ...(message && { message }),
    data,
  };
  return res.status(statusCode).json(responsePayload);
};

export const sendCreated = <T>(
  res: Response,
  data: T,
  message = 'Recurso creado con éxito'
): Response => {
  return sendSuccess(res, data, message, 201);
};

export const sendError = (
  res: Response,
  message = 'Error interno',
  statusCode = 500,
  error?: unknown
): Response => {
  const responsePayload: ApiResponse = {
    success: false,
    message,
    ...(error !== undefined && { error }),
  };
  return res.status(statusCode).json(responsePayload);
};
