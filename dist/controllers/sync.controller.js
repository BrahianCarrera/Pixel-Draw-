"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSyncStatus = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
const appError_js_1 = require("../utils/appError.js");
const getSyncStatus = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw appError_js_1.AppError.unauthorized('No autenticado');
        }
        const user = await prisma_js_1.prisma.user.findUnique({
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
            throw appError_js_1.AppError.notFound('Usuario no encontrado');
        }
        let latestArtwork = null;
        if (user.coupleId) {
            const latest = await prisma_js_1.prisma.artwork.findFirst({
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
            latestArtwork = latest || null;
        }
        const { couple, ...safeUser } = user;
        (0, response_js_1.sendSuccess)(res, {
            user: safeUser,
            couple,
            latestArtwork,
        }, 'Estado sincronizado con éxito');
    }
    catch (error) {
        next(error);
    }
};
exports.getSyncStatus = getSyncStatus;
