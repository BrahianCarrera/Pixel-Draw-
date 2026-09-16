"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userIdParamSchema = exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
exports.createUserSchema = zod_1.z.object({
    email: zod_1.z.email('Formato de correo electrónico inválido'),
    username: zod_1.z
        .string()
        .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
        .max(30, 'El nombre de usuario no puede exceder 30 caracteres')
        .regex(/^[a-zA-Z0-9_]+$/, 'El usuario solo puede contener letras, números y guiones bajos'),
    password: zod_1.z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});
exports.updateUserSchema = zod_1.z.object({
    email: zod_1.z.email('Formato de correo electrónico inválido').optional(),
    username: zod_1.z
        .string()
        .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
        .max(30, 'El nombre de usuario no puede exceder 30 caracteres')
        .regex(/^[a-zA-Z0-9_]+$/, 'El usuario solo puede contener letras, números y guiones bajos')
        .optional(),
    password: zod_1.z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
});
exports.userIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'El ID de usuario es obligatorio'),
});
