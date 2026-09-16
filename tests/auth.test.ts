import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from '../src/schemas/auth.schema.js';
import { authService } from '../src/services/auth.service.js';

describe('Auth Schemas and Utilities', () => {
  describe('registerSchema', () => {
    it('debe validar un registro con datos correctos', () => {
      const valid = {
        email: 'lover1@pixeldraw.io',
        username: 'pixel_lover',
        password: 'password123',
      };
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('debe fallar si el email no es válido', () => {
      const invalid = {
        email: 'invalid-email',
        username: 'pixel_lover',
        password: 'password123',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('debe fallar si la contraseña tiene menos de 6 caracteres', () => {
      const invalid = {
        email: 'lover1@pixeldraw.io',
        username: 'pixel_lover',
        password: '123',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('debe fallar si el nombre de usuario tiene caracteres no permitidos', () => {
      const invalid = {
        email: 'lover1@pixeldraw.io',
        username: 'pixel lover with spaces',
        password: 'password123',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('debe validar login con email o username', () => {
      const resEmail = loginSchema.safeParse({
        emailOrUsername: 'lover1@pixeldraw.io',
        password: 'password123',
      });
      expect(resEmail.success).toBe(true);

      const resUser = loginSchema.safeParse({
        emailOrUsername: 'pixel_lover',
        password: 'password123',
      });
      expect(resUser.success).toBe(true);
    });

    it('debe fallar si faltan campos', () => {
      const result = loginSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('Password Hashing & JWT Verification', () => {
    it('debe hashear una contraseña y verificarla correctamente', async () => {
      const password = 'mySecretSuperPassword123';
      const hash = await authService.hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2')).toBe(true);

      const isValid = await authService.comparePassword(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await authService.comparePassword('wrongPassword', hash);
      expect(isInvalid).toBe(false);
    });

    it('debe firmar y verificar un token JWT', () => {
      const payload = {
        id: 42,
        email: 'test@pixeldraw.io',
        username: 'test_user',
      };

      const token = authService.generateToken(payload);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);

      const decoded = authService.verifyToken(token);
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.username).toBe(payload.username);
    });

    it('debe lanzar error al verificar un token inválido', () => {
      expect(() => authService.verifyToken('invalid.jwt.token')).toThrow();
    });
  });
});
