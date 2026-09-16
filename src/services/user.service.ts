import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema.js';
import { SafeUser } from '../models/user.js';
import { AppError } from '../utils/appError.js';

export class UserService {
  private sanitizeUser(user: {
    id: number;
    username: string;
    password?: string;
    coupleId?: number | null;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  }): SafeUser {
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  async getAllUsers(): Promise<SafeUser[]> {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        coupleId: true,
      },
    });
    return users.map((user) => this.sanitizeUser(user));
  }

  async getUserById(id: number): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        coupleId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw AppError.notFound(`Usuario con id '${id}' no encontrado`);
    }

    return this.sanitizeUser(user);
  }

  async createUser(data: CreateUserInput): Promise<SafeUser> {
    const existingEmail = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
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

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hashedPassword,
      },
    });

    return this.sanitizeUser(user);
  }

  async updateUser(id: number, data: UpdateUserInput): Promise<SafeUser> {
    await this.getUserById(id);

    if (data.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingEmail && existingEmail.id !== id) {
        throw AppError.conflict('El correo electrónico ya está en uso por otra cuenta');
      }
    }

    if (data.username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: data.username },
      });
      if (existingUsername && existingUsername.id !== id) {
        throw AppError.conflict('El nombre de usuario ya está en uso por otra cuenta');
      }
    }

    const updateData: Partial<UpdateUserInput> = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return this.sanitizeUser(updatedUser);
  }

  async deleteUser(id: number): Promise<void> {
    await this.getUserById(id);
    await prisma.user.delete({
      where: { id },
    });
  }
}

export const userService = new UserService();
