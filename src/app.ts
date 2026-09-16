import express, { Application, Request, Response } from 'express';
import apiRouter from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';
import { env } from './config/env.js';

export const createApp = (): Application => {
  const app = express();

  // Middlewares básicos
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS Middleware
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = env.CORS_ORIGIN
      ? env.CORS_ORIGIN.split(',').map(o => o.trim())
      : ['*'];

    if (allowedOrigins.includes('*')) {
      res.header('Access-Control-Allow-Origin', '*');
    } else if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Vary', 'Origin');
    } else if (env.NODE_ENV === 'development') {
      res.header('Access-Control-Allow-Origin', origin || '*');
      res.header('Vary', 'Origin');
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Ruta raíz de bienvenida
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'PixelDraw API',
      status: 'online',
      version: '1.0.0',
      documentation: '/api/v1/health',
    });
  });

  // Rutas API v1
  app.use('/api/v1', apiRouter);

  // Manejador 404
  app.use(notFound);

  // Manejador global de errores
  app.use(errorHandler);

  return app;
};
