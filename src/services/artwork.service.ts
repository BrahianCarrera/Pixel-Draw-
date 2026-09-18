import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';
import {
  CreateArtworkInput,
  UpdateArtworkInput,
} from '../schemas/artwork.schema.js';
import { ArtworkWithAuthor, PaginatedArtworks } from '../models/artwork.js';

export class ArtworkService {
  private authorSelect = {
    id: true,
    username: true,
    email: true,
    coupleId: true,
    createdAt: true,
    updatedAt: true,
  };

  async createArtwork(data: CreateArtworkInput): Promise<ArtworkWithAuthor> {
    const author = await prisma.user.findUnique({
      where: { id: data.authorId },
    });

    if (!author) {
      throw AppError.notFound(`Usuario autor con id '${data.authorId}' no encontrado`);
    }

    if (!author.coupleId || author.coupleId !== data.coupleId) {
      throw AppError.forbidden('El autor debe ser miembro de la pareja para publicar un dibujo en ella');
    }

    const couple = await prisma.couple.findUnique({
      where: { id: data.coupleId },
    });

    if (!couple) {
      throw AppError.notFound(`Pareja con id '${data.coupleId}' no encontrada`);
    }

    const artwork = await prisma.artwork.create({
      data: {
        name: data.name ?? null,
        width: data.width,
        height: data.height,
        grid: data.grid as object,
        coupleId: data.coupleId,
        authorId: data.authorId,
      },
      include: {
        author: {
          select: this.authorSelect,
        },
      },
    });

    // Enviar notificación push a la pareja para actualizar el widget de inmediato
    (async () => {
      try {
        const partner = await prisma.user.findFirst({
          where: {
            coupleId: data.coupleId,
            id: { not: data.authorId },
          },
          select: { pushToken: true },
        });

        if (partner?.pushToken) {
          await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: partner.pushToken,
              sound: 'default',
              title: 'Nuevo dibujo ❤️',
              body: `${author.username} te ha enviado un dibujo`,
              channelId: 'pixeldraw-drawings',
              data: {
                type: 'NEW_DRAWING',
                artwork,
              },
            }),
          });
        }
      } catch (err) {
        console.warn('[ArtworkService] Error al enviar notificación push a la pareja:', err);
      }
    })();

    return artwork as ArtworkWithAuthor;
  }

  async getCoupleArtworks(
    coupleId: number,
    page = 1,
    limit = 20
  ): Promise<PaginatedArtworks> {
    const couple = await prisma.couple.findUnique({
      where: { id: coupleId },
    });

    if (!couple) {
      throw AppError.notFound(`Pareja con id '${coupleId}' no encontrada`);
    }

    const [total, artworks] = await Promise.all([
      prisma.artwork.count({
        where: { coupleId },
      }),
      prisma.artwork.findMany({
        where: { coupleId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: {
            select: this.authorSelect,
          },
        },
      }),
    ]);

    return {
      artworks: artworks as ArtworkWithAuthor[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getLatestArtwork(coupleId: number): Promise<ArtworkWithAuthor | null> {
    const couple = await prisma.couple.findUnique({
      where: { id: coupleId },
    });

    if (!couple) {
      throw AppError.notFound(`Pareja con id '${coupleId}' no encontrada`);
    }

    const latest = await prisma.artwork.findFirst({
      where: { coupleId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: this.authorSelect,
        },
      },
    });

    return (latest as ArtworkWithAuthor) || null;
  }

  async getArtworkById(id: number): Promise<ArtworkWithAuthor> {
    const artwork = await prisma.artwork.findUnique({
      where: { id },
      include: {
        author: {
          select: this.authorSelect,
        },
      },
    });

    if (!artwork) {
      throw AppError.notFound(`Dibujo con id '${id}' no encontrado`);
    }

    return artwork as ArtworkWithAuthor;
  }

  async updateArtwork(
    id: number,
    data: UpdateArtworkInput,
    userId?: number
  ): Promise<ArtworkWithAuthor> {
    const artwork = await this.getArtworkById(id);

    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || user.coupleId !== artwork.coupleId) {
        throw AppError.forbidden('No tienes permiso para actualizar este dibujo');
      }
    }

    const updated = await prisma.artwork.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.grid !== undefined && { grid: data.grid as object }),
      },
      include: {
        author: {
          select: this.authorSelect,
        },
      },
    });

    return updated as ArtworkWithAuthor;
  }

  async deleteArtwork(id: number, userId?: number): Promise<void> {
    const artwork = await this.getArtworkById(id);

    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || (user.id !== artwork.authorId && user.coupleId !== artwork.coupleId)) {
        throw AppError.forbidden('No tienes permiso para eliminar este dibujo');
      }
    }

    await prisma.artwork.delete({
      where: { id },
    });
  }
}

export const artworkService = new ArtworkService();
