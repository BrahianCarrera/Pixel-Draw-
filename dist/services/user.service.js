"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_js_1 = require("../config/prisma.js");
const appError_js_1 = require("../utils/appError.js");
class UserService {
    sanitizeUser(user) {
        const { password: _, ...safeUser } = user;
        return safeUser;
    }
    async getAllUsers() {
        const users = await prisma_js_1.prisma.user.findMany({
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
    async getUserById(id) {
        const user = await prisma_js_1.prisma.user.findUnique({
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
            throw appError_js_1.AppError.notFound(`Usuario con id '${id}' no encontrado`);
        }
        return this.sanitizeUser(user);
    }
    async createUser(data) {
        const existingEmail = await prisma_js_1.prisma.user.findUnique({
            where: {
                email: data.email,
            },
        });
        if (existingEmail) {
            throw appError_js_1.AppError.conflict('El correo electrónico ya se encuentra registrado');
        }
        const existingUsername = await prisma_js_1.prisma.user.findUnique({
            where: { username: data.username },
        });
        if (existingUsername) {
            throw appError_js_1.AppError.conflict('El nombre de usuario ya está en uso');
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        const user = await prisma_js_1.prisma.user.create({
            data: {
                email: data.email,
                username: data.username,
                password: hashedPassword,
            },
        });
        return this.sanitizeUser(user);
    }
    async updateUser(id, data) {
        await this.getUserById(id);
        if (data.email) {
            const existingEmail = await prisma_js_1.prisma.user.findUnique({
                where: { email: data.email },
            });
            if (existingEmail && existingEmail.id !== id) {
                throw appError_js_1.AppError.conflict('El correo electrónico ya está en uso por otra cuenta');
            }
        }
        if (data.username) {
            const existingUsername = await prisma_js_1.prisma.user.findUnique({
                where: { username: data.username },
            });
            if (existingUsername && existingUsername.id !== id) {
                throw appError_js_1.AppError.conflict('El nombre de usuario ya está en uso por otra cuenta');
            }
        }
        const updateData = { ...data };
        if (data.password) {
            updateData.password = await bcryptjs_1.default.hash(data.password, 10);
        }
        const updatedUser = await prisma_js_1.prisma.user.update({
            where: { id },
            data: updateData,
        });
        return this.sanitizeUser(updatedUser);
    }
    async deleteUser(id) {
        await this.getUserById(id);
        await prisma_js_1.prisma.user.delete({
            where: { id },
        });
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
