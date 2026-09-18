import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.email('Formato de correo electrónico inválido'),
  username: z
    .string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(30, 'El nombre de usuario no puede exceder 30 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'El usuario solo puede contener letras, números y guiones bajos'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const updateUserSchema = z.object({
  email: z.email('Formato de correo electrónico inválido').optional(),
  username: z
    .string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(30, 'El nombre de usuario no puede exceder 30 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'El usuario solo puede contener letras, números y guiones bajos')
    .optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  pushToken: z.string().nullable().optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().min(1, 'El ID de usuario es obligatorio'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
