"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z
        .string()
        .default('4000')
        .transform(val => parseInt(val, 10)),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: zod_1.z.string().default('file:./env'),
    CORS_ORIGIN: zod_1.z.string().default('*'),
    JWT_SECRET: zod_1.z.string().default('super-secret-jwt-key-pixeldraw-change-in-prod'),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
});
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    console.error('❌ Error de validación en variables de entorno:', _env.error.format());
    process.exit(1);
}
exports.env = _env.data;
