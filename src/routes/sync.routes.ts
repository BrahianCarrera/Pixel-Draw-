import { Router } from 'express';
import { getSyncStatus } from '../controllers/sync.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// Obtener estado sincronizado en tiempo real (usuario, pareja actual y último dibujo)
router.get(
  '/',
  requireAuth,
  getSyncStatus
);

export default router;
