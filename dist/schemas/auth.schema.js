"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.email('Formato de correo electrónico inválido'),
    username: zod_1.z
        .string()
        .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
        .max(30, 'El nombre de usuario no puede exceder 30 caracteres')
        .regex(/^[a-zA-Z0-9_]+$/, 'El usuario solo puede contener letras, números y guiones bajos'),
    password: zod_1.z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});
exports.loginSchema = zod_1.z.object({
    emailOrUsername: zod_1.z.string().min(1, 'El correo o nombre de usuario es obligatorio'),
    password: zod_1.z.string().min(1, 'La contraseña es obligatoria'),
});
