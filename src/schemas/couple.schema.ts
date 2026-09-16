import { z } from 'zod';

export const createCoupleSchema = z.object({
  userId: z.number({
    error: 'El ID del usuario es obligatorio y debe ser un número',
  }).int().positive('El ID del usuario debe ser un número positivo'),
});

export const joinCoupleSchema = z.object({
  userId: z.number({
    error: 'El ID del usuario es obligatorio y debe ser un número',
  }).int().positive('El ID del usuario debe ser un número positivo'),
  inviteCode: z
    .string({
      error: 'El código de invitación es obligatorio',
    })
    .min(4, 'El código de invitación debe tener al menos 4 caracteres')
    .max(20, 'El código de invitación no puede exceder 20 caracteres')
    .trim()
    .toUpperCase(),
});

export const leaveCoupleSchema = z.object({
  userId: z.number({
    error: 'El ID del usuario es obligatorio y debe ser un número',
  }).int().positive('El ID del usuario debe ser un número positivo'),
});

export const coupleIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'El ID de la pareja debe ser numérico').transform(val => parseInt(val, 10)),
});

export const userIdParamSchema = z.object({
  userId: z.string().regex(/^\d+$/, 'El ID del usuario debe ser numérico').transform(val => parseInt(val, 10)),
});

export const inviteCodeParamSchema = z.object({
  code: z
    .string()
    .min(4, 'El código debe tener al menos 4 caracteres')
    .max(20, 'El código no puede exceder 20 caracteres')
    .trim()
    .toUpperCase(),
});

export type CreateCoupleInput = z.infer<typeof createCoupleSchema>;
export type JoinCoupleInput = z.infer<typeof joinCoupleSchema>;
export type LeaveCoupleInput = z.infer<typeof leaveCoupleSchema>;
export type CoupleIdParam = z.infer<typeof coupleIdParamSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type InviteCodeParam = z.infer<typeof inviteCodeParamSchema>;
