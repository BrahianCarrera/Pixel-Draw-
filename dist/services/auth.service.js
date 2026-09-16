"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_js_1 = require("../config/prisma.js");
const env_js_1 = require("../config/env.js");
const appError_js_1 = require("../utils/appError.js");
class AuthService {
    sanitizeUser(user) {
        const { password: _, ...safeUser } = user;
        return safeUser;
    }
    async hashPassword(password) {
        const saltRounds = 10;
        return bcryptjs_1.default.hash(password, saltRounds);
    }
    async comparePassword(password, hash) {
        return bcryptjs_1.default.compare(password, hash);
    }
    generateToken(payload) {
        return jsonwebtoken_1.default.sign(payload, env_js_1.env.JWT_SECRET, {
            expiresIn: env_js_1.env.JWT_EXPIRES_IN,
        });
    }
    verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, env_js_1.env.JWT_SECRET);
        }
        catch (_err) {
            throw appError_js_1.AppError.unauthorized('Token de autenticación inválido o expirado');
        }
    }
    async register(data) {
        const existingEmail = await prisma_js_1.prisma.user.findUnique({
            where: { email: data.email },
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
        const hashedPassword = await this.hashPassword(data.password);
        const user = await prisma_js_1.prisma.user.create({
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
    async login(data) {
        const user = await prisma_js_1.prisma.user.findFirst({
            where: {
                OR: [
                    { email: data.emailOrUsername },
                    { username: data.emailOrUsername },
                ],
            },
        });
        if (!user) {
            throw appError_js_1.AppError.unauthorized('Credenciales incorrectas');
        }
        const isPasswordValid = await this.comparePassword(data.password, user.password);
        if (!isPasswordValid) {
            throw appError_js_1.AppError.unauthorized('Credenciales incorrectas');
        }
        const safeUser = this.sanitizeUser(user);
        const token = this.generateToken({
            id: user.id,
            email: user.email,
            username: user.username,
        });
        return { user: safeUser, token };
    }
    async getMe(userId) {
        const user = await prisma_js_1.prisma.user.findUnique({
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
            throw appError_js_1.AppError.notFound('Usuario no encontrado');
        }
        const { password: _, ...userWithCouple } = user;
        return userWithCouple;
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
