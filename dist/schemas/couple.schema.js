"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inviteCodeParamSchema = exports.userIdParamSchema = exports.coupleIdParamSchema = exports.leaveCoupleSchema = exports.joinCoupleSchema = exports.createCoupleSchema = void 0;
const zod_1 = require("zod");
exports.createCoupleSchema = zod_1.z.object({
    userId: zod_1.z.number({
        error: 'El ID del usuario es obligatorio y debe ser un número',
    }).int().positive('El ID del usuario debe ser un número positivo'),
});
exports.joinCoupleSchema = zod_1.z.object({
    userId: zod_1.z.number({
        error: 'El ID del usuario es obligatorio y debe ser un número',
    }).int().positive('El ID del usuario debe ser un número positivo'),
    inviteCode: zod_1.z
        .string({
        error: 'El código de invitación es obligatorio',
    })
        .min(4, 'El código de invitación debe tener al menos 4 caracteres')
        .max(20, 'El código de invitación no puede exceder 20 caracteres')
        .trim()
        .toUpperCase(),
});
exports.leaveCoupleSchema = zod_1.z.object({
    userId: zod_1.z.number({
        error: 'El ID del usuario es obligatorio y debe ser un número',
    }).int().positive('El ID del usuario debe ser un número positivo'),
});
exports.coupleIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/, 'El ID de la pareja debe ser numérico').transform(val => parseInt(val, 10)),
});
exports.userIdParamSchema = zod_1.z.object({
    userId: zod_1.z.string().regex(/^\d+$/, 'El ID del usuario debe ser numérico').transform(val => parseInt(val, 10)),
});
exports.inviteCodeParamSchema = zod_1.z.object({
    code: zod_1.z
        .string()
        .min(4, 'El código debe tener al menos 4 caracteres')
        .max(20, 'El código no puede exceder 20 caracteres')
        .trim()
        .toUpperCase(),
});
