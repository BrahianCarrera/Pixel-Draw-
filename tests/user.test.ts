import { describe, it, expect } from 'vitest';
import { createUserSchema } from '../src/schemas/user.schema.js';

describe('User Schemas Validation', () => {
  it('debe validar exitosamente un usuario con datos correctos', () => {
    const validData = {
      email: 'test@pixeldraw.io',
      username: 'pixel_artist',
      password: 'secretPassword123',
    };

    const result = createUserSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('debe fallar si el email no es válido', () => {
    const invalidData = {
      email: 'no-es-un-email',
      username: 'pixel_artist',
      password: 'secretPassword123',
    };

    const result = createUserSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('debe fallar si la contraseña tiene menos de 6 caracteres', () => {
    const invalidData = {
      email: 'test@pixeldraw.io',
      username: 'pixel_artist',
      password: '123',
    };

    const result = createUserSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
