"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coupleArtworksQuerySchema = exports.coupleParamSchema = exports.artworkIdParamSchema = exports.updateArtworkSchema = exports.createArtworkSchema = void 0;
const zod_1 = require("zod");
exports.createArtworkSchema = zod_1.z.object({
    name: zod_1.z.string().max(100, 'El nombre del dibujo no puede exceder 100 caracteres').optional(),
    width: zod_1.z
        .number()
        .int('El ancho debe ser un número entero')
        .min(8, 'El ancho mínimo es de 8 píxeles')
        .max(128, 'El ancho máximo es de 128 píxeles')
        .default(32),
    height: zod_1.z
        .number()
        .int('El alto debe ser un número entero')
        .min(8, 'El alto mínimo es de 8 píxeles')
        .max(128, 'El alto máximo es de 128 píxeles')
        .default(32),
    grid: zod_1.z.union([
        zod_1.z.array(zod_1.z.array(zod_1.z.string())),
        zod_1.z.array(zod_1.z.string()),
        zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
        zod_1.z.any(),
    ], {
        error: 'La cuadrícula (grid) de píxeles es requerida',
    }),
    coupleId: zod_1.z.number({
        error: 'El ID de la pareja es obligatorio',
    }).int().positive('El ID de la pareja debe ser un número positivo'),
    authorId: zod_1.z.number({
        error: 'El ID del autor es obligatorio',
    }).int().positive('El ID del autor debe ser un número positivo'),
});
exports.updateArtworkSchema = zod_1.z.object({
    name: zod_1.z.string().max(100, 'El nombre del dibujo no puede exceder 100 caracteres').optional(),
    grid: zod_1.z.union([
        zod_1.z.array(zod_1.z.array(zod_1.z.string())),
        zod_1.z.array(zod_1.z.string()),
        zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
        zod_1.z.any(),
    ]).optional(),
});
exports.artworkIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/, 'El ID del dibujo debe ser numérico').transform(val => parseInt(val, 10)),
});
exports.coupleParamSchema = zod_1.z.object({
    coupleId: zod_1.z.string().regex(/^\d+$/, 'El ID de la pareja debe ser numérico').transform(val => parseInt(val, 10)),
});
exports.coupleArtworksQuerySchema = zod_1.z.object({
    page: zod_1.z
        .string()
        .optional()
        .default('1')
        .transform(val => Math.max(1, parseInt(val, 10) || 1)),
    limit: zod_1.z
        .string()
        .optional()
        .default('20')
        .transform(val => Math.min(100, Math.max(1, parseInt(val, 10) || 20))),
});
