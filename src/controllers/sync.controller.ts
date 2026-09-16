import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../utils/appError.js';
import { ArtworkWithAuthor } from '../models/artwork.js';

export const getSyncStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized('No autenticado');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        coupleId: true,
        createdAt: true,
        updatedAt: true,
        couple: {
          include: {
            members: {
              select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
                updatedAt: true,
              },
            },
            _count: {
              select: { artworks: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw AppError.notFound('Usuario no encontrado');
    }

    let latestArtwork: ArtworkWithAuthor | null = null;

    if (user.coupleId) {
      const latest = await prisma.artwork.findFirst({
        where: { coupleId: user.coupleId },
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
              coupleId: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });
      latestArtwork = (latest as ArtworkWithAuthor) || null;
    }

    const { couple, ...safeUser } = user;

    sendSuccess(
      res,
      {
        user: safeUser,
        couple,
        latestArtwork,
      },
      'Estado sincronizado con éxito'
    );
  } catch (error) {
    next(error);
  }
};
