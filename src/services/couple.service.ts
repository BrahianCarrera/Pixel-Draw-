import crypto from 'node:crypto';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';
import { CoupleWithMembers } from '../models/couple.js';
import { SafeUser } from '../models/user.js';

export class CoupleService {
  private sanitizeUser(user: {
    id: number;
    username: string;
    password?: string;
    email: string;
    coupleId?: number | null;
    createdAt: Date;
    updatedAt: Date;
  }): SafeUser {
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  private sanitizeCouple(couple: {
    id: number;
    inviteCode: string | null;
    createdAt: Date;
    updatedAt: Date;
    members: Array<{
      id: number;
      username: string;
      password?: string;
      email: string;
      coupleId?: number | null;
      createdAt: Date;
      updatedAt: Date;
    }>;
    _count?: {
      artworks: number;
    };
  }): CoupleWithMembers {
    return {
      ...couple,
      members: couple.members.map(member => this.sanitizeUser(member)),
    };
  }

  private async generateUniqueInviteCode(): Promise<string> {
    let isUnique = false;
    let code = '';
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      // Genera un código legible estilo 'PX-7B3A9C'
      const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
      code = `PX-${randomHex}`;

      const existing = await prisma.couple.findUnique({
        where: { inviteCode: code },
      });

      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw AppError.internal('No se pudo generar un código de invitación único');
    }

    return code;
  }

  async createCouple(userId: number): Promise<CoupleWithMembers> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw AppError.notFound(`Usuario con id '${userId}' no encontrado`);
    }

    if (user.coupleId) {
      throw AppError.badRequest('El usuario ya pertenece a una pareja');
    }

    const inviteCode = await this.generateUniqueInviteCode();

    const createdCouple = await prisma.$transaction(async tx => {
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

  async joinCouple(userId: number, inviteCode: string): Promise<CoupleWithMembers> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw AppError.notFound(`Usuario con id '${userId}' no encontrado`);
    }

    if (user.coupleId) {
      throw AppError.badRequest('El usuario ya pertenece a una pareja');
    }

    const couple = await prisma.couple.findUnique({
      where: { inviteCode },
      include: { members: true },
    });

    if (!couple) {
      throw AppError.notFound('Código de invitación no válido o inexistente');
    }

    if (couple.members.length >= 2) {
      throw AppError.conflict('Esta pareja ya tiene el límite máximo de 2 integrantes');
    }

    if (couple.members.some(member => member.id === userId)) {
      throw AppError.badRequest('Ya eres miembro de esta pareja');
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        coupleId: couple.id,
      },
    });

    return this.getCoupleById(couple.id);
  }

  async getCoupleById(coupleId: number): Promise<CoupleWithMembers> {
    const couple = await prisma.couple.findUnique({
      where: { id: coupleId },
      include: {
        members: true,
        _count: {
          select: { artworks: true },
        },
      },
    });

    if (!couple) {
      throw AppError.notFound(`Pareja con id '${coupleId}' no encontrada`);
    }

    return this.sanitizeCouple(couple);
  }

  async getCoupleByUserId(userId: number): Promise<CoupleWithMembers> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw AppError.notFound(`Usuario con id '${userId}' no encontrado`);
    }

    if (!user.coupleId) {
      throw AppError.notFound('El usuario no pertenece a ninguna pareja actualmente');
    }

    return this.getCoupleById(user.coupleId);
  }

  async getCoupleByInviteCode(inviteCode: string): Promise<CoupleWithMembers> {
    const couple = await prisma.couple.findUnique({
      where: { inviteCode },
      include: {
        members: true,
        _count: {
          select: { artworks: true },
        },
      },
    });

    if (!couple) {
      throw AppError.notFound('Código de invitación no encontrado');
    }

    return this.sanitizeCouple(couple);
  }

  async regenerateInviteCode(coupleId: number, userId: number): Promise<CoupleWithMembers> {
    const couple = await prisma.couple.findUnique({
      where: { id: coupleId },
      include: { members: true },
    });

    if (!couple) {
      throw AppError.notFound(`Pareja con id '${coupleId}' no encontrada`);
    }

    const isMember = couple.members.some(member => member.id === userId);
    if (!isMember) {
      throw AppError.forbidden('No tienes permiso para modificar esta pareja');
    }

    if (couple.members.length >= 2) {
      throw AppError.badRequest('No se puede generar un nuevo código para una pareja que ya está completa');
    }

    const newCode = await this.generateUniqueInviteCode();

    await prisma.couple.update({
      where: { id: coupleId },
      data: { inviteCode: newCode },
    });

    return this.getCoupleById(coupleId);
  }

  async leaveCouple(userId: number): Promise<{ success: boolean; message: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw AppError.notFound(`Usuario con id '${userId}' no encontrado`);
    }

    if (!user.coupleId) {
      throw AppError.badRequest('El usuario no pertenece a ninguna pareja');
    }

    const coupleId = user.coupleId;

    await prisma.user.update({
      where: { id: userId },
      data: { coupleId: null },
    });

    // Revisar si quedan miembros restantes
    const remainingMembers = await prisma.user.count({
      where: { coupleId },
    });

    if (remainingMembers === 0) {
      // Si no queda nadie en la pareja, la eliminamos
      await prisma.couple.delete({
        where: { id: coupleId },
      });
    }

    return {
      success: true,
      message: 'Te has desvinculado de la pareja con éxito',
    };
  }
}

export const coupleService = new CoupleService();
