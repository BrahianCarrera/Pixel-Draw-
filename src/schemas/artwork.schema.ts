import { z } from 'zod';

export const createArtworkSchema = z.object({
  name: z.string().max(100, 'El nombre del dibujo no puede exceder 100 caracteres').optional(),
  width: z
    .number()
    .int('El ancho debe ser un número entero')
    .min(8, 'El ancho mínimo es de 8 píxeles')
    .max(128, 'El ancho máximo es de 128 píxeles')
    .default(32),
  height: z
    .number()
    .int('El alto debe ser un número entero')
    .min(8, 'El alto mínimo es de 8 píxeles')
    .max(128, 'El alto máximo es de 128 píxeles')
    .default(32),
  grid: z.union([
    z.array(z.array(z.string())),
    z.array(z.string()),
    z.record(z.string(), z.any()),
    z.any(),
  ], {
    error: 'La cuadrícula (grid) de píxeles es requerida',
  }),
  coupleId: z.number({
    error: 'El ID de la pareja es obligatorio',
  }).int().positive('El ID de la pareja debe ser un número positivo'),
  authorId: z.number({
    error: 'El ID del autor es obligatorio',
  }).int().positive('El ID del autor debe ser un número positivo'),
});

export const updateArtworkSchema = z.object({
  name: z.string().max(100, 'El nombre del dibujo no puede exceder 100 caracteres').optional(),
  grid: z.union([
    z.array(z.array(z.string())),
    z.array(z.string()),
    z.record(z.string(), z.any()),
    z.any(),
  ]).optional(),
});

export const artworkIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'El ID del dibujo debe ser numérico').transform(val => parseInt(val, 10)),
});

export const coupleParamSchema = z.object({
  coupleId: z.string().regex(/^\d+$/, 'El ID de la pareja debe ser numérico').transform(val => parseInt(val, 10)),
});

export const coupleArtworksQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(val => Math.max(1, parseInt(val, 10) || 1)),
  limit: z
    .string()
    .optional()
    .default('20')
    .transform(val => Math.min(100, Math.max(1, parseInt(val, 10) || 20))),
});

export type CreateArtworkInput = z.infer<typeof createArtworkSchema>;
export type UpdateArtworkInput = z.infer<typeof updateArtworkSchema>;
export type ArtworkIdParam = z.infer<typeof artworkIdParamSchema>;
export type CoupleParam = z.infer<typeof coupleParamSchema>;
export type CoupleArtworksQuery = z.infer<typeof coupleArtworksQuerySchema>;
