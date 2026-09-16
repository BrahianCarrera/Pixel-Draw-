import { Router } from 'express';
import {
  createCouple,
  joinCouple,
  getCoupleById,
  getCoupleByUserId,
  getCoupleByInviteCode,
  regenerateInviteCode,
  leaveCouple,
} from '../controllers/couple.controller.js';
import { validate } from '../middlewares/validate.js';
import {
  createCoupleSchema,
  joinCoupleSchema,
  leaveCoupleSchema,
  coupleIdParamSchema,
  userIdParamSchema,
  inviteCodeParamSchema,
} from '../schemas/couple.schema.js';

const router = Router();

// Crear pareja y generar código de invitación
router.post(
  '/',
  validate({ body: createCoupleSchema }),
  createCouple
);

// Unirse a una pareja existente usando código de invitación
router.post(
  '/join',
  validate({ body: joinCoupleSchema }),
  joinCouple
);

// Salir / desvincularse de una pareja
router.post(
  '/leave',
  validate({ body: leaveCoupleSchema }),
  leaveCouple
);

// Buscar pareja por código de invitación
router.get(
  '/code/:code',
  validate({ params: inviteCodeParamSchema }),
  getCoupleByInviteCode
);

// Obtener la pareja de un usuario
router.get(
  '/user/:userId',
  validate({ params: userIdParamSchema }),
  getCoupleByUserId
);

// Obtener datos de la pareja por su ID
router.get(
  '/:id',
  validate({ params: coupleIdParamSchema }),
  getCoupleById
);

// Regenerar código de invitación (si aún no se ha unido la pareja)
router.post(
  '/:id/regenerate-code',
  validate({ params: coupleIdParamSchema, body: createCoupleSchema }),
  regenerateInviteCode
);

export default router;
