import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email('Formato de correo electrónico inválido'),
  username: z
    .string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(30, 'El nombre de usuario no puede exceder 30 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'El usuario solo puede contener letras, números y guiones bajos'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'El correo o nombre de usuario es obligatorio'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
