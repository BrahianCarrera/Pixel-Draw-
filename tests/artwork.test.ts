import { describe, it, expect } from 'vitest';
import {
  createArtworkSchema,
  updateArtworkSchema,
  artworkIdParamSchema,
  coupleParamSchema,
  coupleArtworksQuerySchema,
} from '../src/schemas/artwork.schema.js';

describe('Artwork Schemas Validation', () => {
  describe('createArtworkSchema', () => {
    it('debe validar un dibujo completo con dimensiones personalizadas', () => {
      const validArtwork = {
        name: 'Gatito espacial',
        width: 16,
        height: 16,
        grid: [
          ['#ffffff', '#000000'],
          ['#000000', '#ffffff'],
        ],
        coupleId: 1,
        authorId: 5,
      };

      const result = createArtworkSchema.safeParse(validArtwork);
      expect(result.success).toBe(true);
    });

    it('debe asignar ancho y alto por defecto de 32x32', () => {
      const payload = {
        grid: { pixels: ['#ff0000'] },
        coupleId: 1,
        authorId: 2,
      };

      const result = createArtworkSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.width).toBe(32);
        expect(result.data.height).toBe(32);
      }
    });

    it('debe fallar si las dimensiones son menores al mínimo (8px)', () => {
      const invalid = {
        width: 4,
        height: 4,
        grid: [],
        coupleId: 1,
        authorId: 2,
      };

      const result = createArtworkSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('debe fallar si las dimensiones superan el máximo (128px)', () => {
      const invalid = {
        width: 256,
        height: 256,
        grid: [],
        coupleId: 1,
        authorId: 2,
      };

      const result = createArtworkSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('debe fallar si falta authorId o coupleId', () => {
      const result = createArtworkSchema.safeParse({
        grid: [],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateArtworkSchema', () => {
    it('debe permitir actualizar solo el nombre o solo el grid', () => {
      const resName = updateArtworkSchema.safeParse({ name: 'Nuevo nombre' });
      expect(resName.success).toBe(true);

      const resGrid = updateArtworkSchema.safeParse({ grid: [['#111111']] });
      expect(resGrid.success).toBe(true);
    });
  });

  describe('coupleArtworksQuerySchema', () => {
    it('debe asignar página 1 y límite 20 por defecto', () => {
      const result = coupleArtworksQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('debe parsear y limitar los valores numéricos correctamente', () => {
      const result = coupleArtworksQuerySchema.safeParse({ page: '2', limit: '50' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(50);
      }
    });
  });

  describe('Param Schemas', () => {
    it('debe parsear id y coupleId numéricos', () => {
      const artRes = artworkIdParamSchema.safeParse({ id: '99' });
      expect(artRes.success).toBe(true);
      if (artRes.success) expect(artRes.data.id).toBe(99);

      const coupleRes = coupleParamSchema.safeParse({ coupleId: '12' });
      expect(coupleRes.success).toBe(true);
      if (coupleRes.success) expect(coupleRes.data.coupleId).toBe(12);
    });
  });
});
