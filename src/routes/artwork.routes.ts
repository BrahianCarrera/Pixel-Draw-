import { Router } from 'express';
import {
  createArtwork,
  getCoupleArtworks,
  getLatestArtwork,
  getArtworkById,
  updateArtwork,
  deleteArtwork,
} from '../controllers/artwork.controller.js';
import { validate } from '../middlewares/validate.js';
import {
  createArtworkSchema,
  updateArtworkSchema,
  artworkIdParamSchema,
  coupleParamSchema,
  coupleArtworksQuerySchema,
} from '../schemas/artwork.schema.js';

const router = Router();

// Crear un nuevo dibujo y compartirlo a la pareja
router.post(
  '/',
  validate({ body: createArtworkSchema }),
  createArtwork
);

// Obtener la galería de dibujos de la pareja (con paginación)
router.get(
  '/couple/:coupleId',
  validate({ params: coupleParamSchema, query: coupleArtworksQuerySchema }),
  getCoupleArtworks
);

// Obtener el último dibujo enviado/activo de la pareja (ideal para widgets / pantalla principal)
router.get(
  '/couple/:coupleId/latest',
  validate({ params: coupleParamSchema }),
  getLatestArtwork
);

// Obtener un dibujo específico por su ID
router.get(
  '/:id',
  validate({ params: artworkIdParamSchema }),
  getArtworkById
);

// Modificar un dibujo existente (nombre o cuadrícula)
router.patch(
  '/:id',
  validate({ params: artworkIdParamSchema, body: updateArtworkSchema }),
  updateArtwork
);

// Eliminar un dibujo
router.delete(
  '/:id',
  validate({ params: artworkIdParamSchema }),
  deleteArtwork
);

export default router;
