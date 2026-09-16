import { Request, Response, NextFunction } from 'express';
import { artworkService } from '../services/artwork.service.js';
import { sendCreated, sendSuccess } from '../utils/response.js';
import {
  CreateArtworkInput,
  UpdateArtworkInput,
  CoupleArtworksQuery,
} from '../schemas/artwork.schema.js';

export const createArtwork = async (
  req: Request<{}, {}, CreateArtworkInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const artwork = await artworkService.createArtwork(req.body);
    sendCreated(res, artwork, 'Dibujo compartido con éxito a tu pareja');
  } catch (error) {
    next(error);
  }
};

export const getCoupleArtworks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const coupleId = Number(req.params.coupleId);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await artworkService.getCoupleArtworks(coupleId, page, limit);
    sendSuccess(res, result, 'Galería de dibujos obtenida correctamente');
  } catch (error) {
    next(error);
  }
};

export const getLatestArtwork = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const coupleId = Number(req.params.coupleId);
    const latest = await artworkService.getLatestArtwork(coupleId);
    sendSuccess(res, latest, 'Último dibujo de la pareja obtenido');
  } catch (error) {
    next(error);
  }
};

export const getArtworkById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const artwork = await artworkService.getArtworkById(id);
    sendSuccess(res, artwork, 'Dibujo encontrado');
  } catch (error) {
    next(error);
  }
};

export const updateArtwork = async (
  req: Request<{ id: string }, {}, UpdateArtworkInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const updated = await artworkService.updateArtwork(id, req.body);
    sendSuccess(res, updated, 'Dibujo actualizado con éxito');
  } catch (error) {
    next(error);
  }
};

export const deleteArtwork = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await artworkService.deleteArtwork(id);
    sendSuccess(res, { id }, 'Dibujo eliminado con éxito');
  } catch (error) {
    next(error);
  }
};
