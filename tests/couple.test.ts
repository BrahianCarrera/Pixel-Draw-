import { describe, it, expect } from 'vitest';
import {
  createCoupleSchema,
  joinCoupleSchema,
  leaveCoupleSchema,
  coupleIdParamSchema,
  inviteCodeParamSchema,
} from '../src/schemas/couple.schema.js';

describe('Couple Schemas Validation', () => {
  describe('createCoupleSchema', () => {
    it('debe validar exitosamente cuando se envía un userId válido', () => {
      const result = createCoupleSchema.safeParse({ userId: 1 });
      expect(result.success).toBe(true);
    });

    it('debe fallar si userId no es un número positivo', () => {
      const result = createCoupleSchema.safeParse({ userId: -5 });
      expect(result.success).toBe(false);
    });

    it('debe fallar si falta userId', () => {
      const result = createCoupleSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('joinCoupleSchema', () => {
    it('debe validar exitosamente un userId y un inviteCode', () => {
      const result = joinCoupleSchema.safeParse({
        userId: 2,
        inviteCode: 'PX-9A4B12',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.inviteCode).toBe('PX-9A4B12');
      }
    });

    it('debe transformar y recortar el código de invitación a mayúsculas', () => {
      const result = joinCoupleSchema.safeParse({
        userId: 2,
        inviteCode: '  px-9a4b12  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.inviteCode).toBe('PX-9A4B12');
      }
    });

    it('debe fallar si el código de invitación es muy corto', () => {
      const result = joinCoupleSchema.safeParse({
        userId: 2,
        inviteCode: 'PX',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('leaveCoupleSchema', () => {
    it('debe validar cuando el userId es correcto', () => {
      const result = leaveCoupleSchema.safeParse({ userId: 10 });
      expect(result.success).toBe(true);
    });
  });

  describe('coupleIdParamSchema & inviteCodeParamSchema', () => {
    it('debe transformar id string a número', () => {
      const result = coupleIdParamSchema.safeParse({ id: '42' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(42);
      }
    });

    it('debe fallar si el id no es numérico', () => {
      const result = coupleIdParamSchema.safeParse({ id: 'abc' });
      expect(result.success).toBe(false);
    });

    it('debe normalizar el código de invitación en mayúsculas', () => {
      const result = inviteCodeParamSchema.safeParse({ code: 'px-test12' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.code).toBe('PX-TEST12');
      }
    });
  });
});
