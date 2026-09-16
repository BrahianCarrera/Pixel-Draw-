import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response.js';

export const getHealth = (_req: Request, res: Response): void => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'pixeldraw-backend',
    version: '1.0.0',
  };

  sendSuccess(res, healthData, 'Servicio operativo');
};
