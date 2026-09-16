"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.artworkService = exports.ArtworkService = void 0;
const prisma_js_1 = require("../config/prisma.js");
const appError_js_1 = require("../utils/appError.js");
class ArtworkService {
    authorSelect = {
        id: true,
        username: true,
        email: true,
        coupleId: true,
        createdAt: true,
        updatedAt: true,
    };
    async createArtwork(data) {
        const author = await prisma_js_1.prisma.user.findUnique({
            where: { id: data.authorId },
        });
        if (!author) {
            throw appError_js_1.AppError.notFound(`Usuario autor con id '${data.authorId}' no encontrado`);
        }
        if (!author.coupleId || author.coupleId !== data.coupleId) {
            throw appError_js_1.AppError.forbidden('El autor debe ser miembro de la pareja para publicar un dibujo en ella');
        }
        const couple = await prisma_js_1.prisma.couple.findUnique({
            where: { id: data.coupleId },
        });
        if (!couple) {
            throw appError_js_1.AppError.notFound(`Pareja con id '${data.coupleId}' no encontrada`);
        }
        const artwork = await prisma_js_1.prisma.artwork.create({
            data: {
                name: data.name ?? null,
                width: data.width,
                height: data.height,
                grid: data.grid,
                coupleId: data.coupleId,
                authorId: data.authorId,
            },
            include: {
                author: {
                    select: this.authorSelect,
                },
            },
        });
        return artwork;
    }
    async getCoupleArtworks(coupleId, page = 1, limit = 20) {
        const couple = await prisma_js_1.prisma.couple.findUnique({
            where: { id: coupleId },
        });
        if (!couple) {
            throw appError_js_1.AppError.notFound(`Pareja con id '${coupleId}' no encontrada`);
        }
        const [total, artworks] = await Promise.all([
            prisma_js_1.prisma.artwork.count({
                where: { coupleId },
            }),
            prisma_js_1.prisma.artwork.findMany({
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
            artworks: artworks,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        };
    }
    async getLatestArtwork(coupleId) {
        const couple = await prisma_js_1.prisma.couple.findUnique({
            where: { id: coupleId },
        });
        if (!couple) {
            throw appError_js_1.AppError.notFound(`Pareja con id '${coupleId}' no encontrada`);
        }
        const latest = await prisma_js_1.prisma.artwork.findFirst({
            where: { coupleId },
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: this.authorSelect,
                },
            },
        });
        return latest || null;
    }
    async getArtworkById(id) {
        const artwork = await prisma_js_1.prisma.artwork.findUnique({
            where: { id },
            include: {
                author: {
                    select: this.authorSelect,
                },
            },
        });
        if (!artwork) {
            throw appError_js_1.AppError.notFound(`Dibujo con id '${id}' no encontrado`);
        }
        return artwork;
    }
    async updateArtwork(id, data, userId) {
        const artwork = await this.getArtworkById(id);
        if (userId) {
            const user = await prisma_js_1.prisma.user.findUnique({ where: { id: userId } });
            if (!user || user.coupleId !== artwork.coupleId) {
                throw appError_js_1.AppError.forbidden('No tienes permiso para actualizar este dibujo');
            }
        }
        const updated = await prisma_js_1.prisma.artwork.update({
            where: { id },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.grid !== undefined && { grid: data.grid }),
            },
            include: {
                author: {
                    select: this.authorSelect,
                },
            },
        });
        return updated;
    }
    async deleteArtwork(id, userId) {
        const artwork = await this.getArtworkById(id);
        if (userId) {
            const user = await prisma_js_1.prisma.user.findUnique({ where: { id: userId } });
            if (!user || (user.id !== artwork.authorId && user.coupleId !== artwork.coupleId)) {
                throw appError_js_1.AppError.forbidden('No tienes permiso para eliminar este dibujo');
            }
        }
        await prisma_js_1.prisma.artwork.delete({
            where: { id },
        });
    }
}
exports.ArtworkService = ArtworkService;
exports.artworkService = new ArtworkService();
