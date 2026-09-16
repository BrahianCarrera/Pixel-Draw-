import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/user.controller.js';
import { validate } from '../middlewares/validate.js';
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
} from '../schemas/user.schema.js';

const router = Router();

router.get('/', getUsers);

router.get(
  '/:id',
  validate({ params: userIdParamSchema }),
  getUserById
);

router.post(
  '/',
  validate({ body: createUserSchema }),
  createUser
);

router.patch(
  '/:id',
  validate({ params: userIdParamSchema, body: updateUserSchema }),
  updateUser
);

router.delete(
  '/:id',
  validate({ params: userIdParamSchema }),
  deleteUser
);

export default router;
