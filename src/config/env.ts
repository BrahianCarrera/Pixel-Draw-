import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z
    .string()
    .default('4000')
    .transform(val => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('file:./env'),
  CORS_ORIGIN: z.string().default('*'),
  JWT_SECRET: z.string().default('super-secret-jwt-key-pixeldraw-change-in-prod'),
  JWT_EXPIRES_IN: z.string().default('7d'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Error de validación en variables de entorno:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
