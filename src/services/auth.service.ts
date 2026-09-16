import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';
import { RegisterInput, LoginInput } from '../schemas/auth.schema.js';
import { SafeUser } from '../models/user.js';

export interface AuthResponse {
  user: SafeUser;
  token: string;
}

export interface JwtPayload {
  id: number;
  email: string;
  username: string;
}

export class AuthService {
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

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch (_err) {
      throw AppError.unauthorized('Token de autenticación inválido o expirado');
    }
  }

  async register(data: RegisterInput): Promise<AuthResponse> {
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingEmail) {
      throw AppError.conflict('El correo electrónico ya se encuentra registrado');
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUsername) {
      throw AppError.conflict('El nombre de usuario ya está en uso');
    }

    const hashedPassword = await this.hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hashedPassword,
      },
    });

    const safeUser = this.sanitizeUser(user);
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    return { user: safeUser, token };
  }

  async login(data: LoginInput): Promise<AuthResponse> {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.emailOrUsername },
          { username: data.emailOrUsername },
        ],
      },
    });

    if (!user) {
      throw AppError.unauthorized('Credenciales incorrectas');
    }

    const isPasswordValid = await this.comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Credenciales incorrectas');
    }

    const safeUser = this.sanitizeUser(user);
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    return { user: safeUser, token };
  }

  async getMe(userId: number): Promise<SafeUser & { couple: unknown | null }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
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
          },
        },
      },
    });

    if (!user) {
      throw AppError.notFound('Usuario no encontrado');
    }

    const { password: _, ...userWithCouple } = user;
    return userWithCouple;
  }
}

export const authService = new AuthService();
