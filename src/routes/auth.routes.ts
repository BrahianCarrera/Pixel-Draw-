import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

const router = Router();

// Registro de nuevo usuario
router.post(
  '/register',
  validate({ body: registerSchema }),
  register
);

// Inicio de sesión (con email o username)
router.post(
  '/login',
  validate({ body: loginSchema }),
  login
);

// Obtener perfil actual y estado de pareja
router.get(
  '/me',
  requireAuth,
  getMe
);

export default router;
