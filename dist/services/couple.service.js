"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.coupleService = exports.CoupleService = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const prisma_js_1 = require("../config/prisma.js");
const appError_js_1 = require("../utils/appError.js");
class CoupleService {
    sanitizeUser(user) {
        const { password: _, ...safeUser } = user;
        return safeUser;
    }
    sanitizeCouple(couple) {
        return {
            ...couple,
            members: couple.members.map(member => this.sanitizeUser(member)),
        };
    }
    async generateUniqueInviteCode() {
        let isUnique = false;
        let code = '';
        let attempts = 0;
        while (!isUnique && attempts < 10) {
            // Genera un código legible estilo 'PX-7B3A9C'
            const randomHex = node_crypto_1.default.randomBytes(3).toString('hex').toUpperCase();
            code = `PX-${randomHex}`;
            const existing = await prisma_js_1.prisma.couple.findUnique({
                where: { inviteCode: code },
            });
            if (!existing) {
                isUnique = true;
            }
            attempts++;
        }
        if (!isUnique) {
            throw appError_js_1.AppError.internal('No se pudo generar un código de invitación único');
        }
        return code;
    }
    async createCouple(userId) {
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw appError_js_1.AppError.notFound(`Usuario con id '${userId}' no encontrado`);
        }
        if (user.coupleId) {
            throw appError_js_1.AppError.badRequest('El usuario ya pertenece a una pareja');
        }
        const inviteCode = await this.generateUniqueInviteCode();
        const createdCouple = await prisma_js_1.prisma.$transaction(async (tx) => {
            const couple = await tx.couple.create({
                data: {
                    inviteCode,
                },
            });
            await tx.user.update({
                where: { id: userId },
                data: {
                    coupleId: couple.id,
                },
            });
            return couple;
        });
        return this.getCoupleById(createdCouple.id);
    }
    async joinCouple(userId, inviteCode) {
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw appError_js_1.AppError.notFound(`Usuario con id '${userId}' no encontrado`);
        }
        if (user.coupleId) {
            throw appError_js_1.AppError.badRequest('El usuario ya pertenece a una pareja');
        }
        const couple = await prisma_js_1.prisma.couple.findUnique({
            where: { inviteCode },
            include: { members: true },
        });
        if (!couple) {
            throw appError_js_1.AppError.notFound('Código de invitación no válido o inexistente');
        }
        if (couple.members.length >= 2) {
            throw appError_js_1.AppError.conflict('Esta pareja ya tiene el límite máximo de 2 integrantes');
        }
        if (couple.members.some(member => member.id === userId)) {
            throw appError_js_1.AppError.badRequest('Ya eres miembro de esta pareja');
        }
        await prisma_js_1.prisma.user.update({
            where: { id: userId },
            data: {
                coupleId: couple.id,
            },
        });
        return this.getCoupleById(couple.id);
    }
    async getCoupleById(coupleId) {
        const couple = await prisma_js_1.prisma.couple.findUnique({
            where: { id: coupleId },
            include: {
                members: true,
                _count: {
                    select: { artworks: true },
                },
            },
        });
        if (!couple) {
            throw appError_js_1.AppError.notFound(`Pareja con id '${coupleId}' no encontrada`);
        }
        return this.sanitizeCouple(couple);
    }
    async getCoupleByUserId(userId) {
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw appError_js_1.AppError.notFound(`Usuario con id '${userId}' no encontrado`);
        }
        if (!user.coupleId) {
            throw appError_js_1.AppError.notFound('El usuario no pertenece a ninguna pareja actualmente');
        }
        return this.getCoupleById(user.coupleId);
    }
    async getCoupleByInviteCode(inviteCode) {
        const couple = await prisma_js_1.prisma.couple.findUnique({
            where: { inviteCode },
            include: {
                members: true,
                _count: {
                    select: { artworks: true },
                },
            },
        });
        if (!couple) {
            throw appError_js_1.AppError.notFound('Código de invitación no encontrado');
        }
        return this.sanitizeCouple(couple);
    }
    async regenerateInviteCode(coupleId, userId) {
        const couple = await prisma_js_1.prisma.couple.findUnique({
            where: { id: coupleId },
            include: { members: true },
        });
        if (!couple) {
            throw appError_js_1.AppError.notFound(`Pareja con id '${coupleId}' no encontrada`);
        }
        const isMember = couple.members.some(member => member.id === userId);
        if (!isMember) {
            throw appError_js_1.AppError.forbidden('No tienes permiso para modificar esta pareja');
        }
        if (couple.members.length >= 2) {
            throw appError_js_1.AppError.badRequest('No se puede generar un nuevo código para una pareja que ya está completa');
        }
        const newCode = await this.generateUniqueInviteCode();
        await prisma_js_1.prisma.couple.update({
            where: { id: coupleId },
            data: { inviteCode: newCode },
        });
        return this.getCoupleById(coupleId);
    }
    async leaveCouple(userId) {
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw appError_js_1.AppError.notFound(`Usuario con id '${userId}' no encontrado`);
        }
        if (!user.coupleId) {
            throw appError_js_1.AppError.badRequest('El usuario no pertenece a ninguna pareja');
        }
        const coupleId = user.coupleId;
        await prisma_js_1.prisma.user.update({
            where: { id: userId },
            data: { coupleId: null },
        });
        // Revisar si quedan miembros restantes
        const remainingMembers = await prisma_js_1.prisma.user.count({
            where: { coupleId },
        });
        if (remainingMembers === 0) {
            // Si no queda nadie en la pareja, la eliminamos
            await prisma_js_1.prisma.couple.delete({
                where: { id: coupleId },
            });
        }
        return {
            success: true,
            message: 'Te has desvinculado de la pareja con éxito',
        };
    }
}
exports.CoupleService = CoupleService;
exports.coupleService = new CoupleService();
