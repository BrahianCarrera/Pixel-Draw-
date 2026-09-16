"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    isOperational;
    details;
    constructor(message, statusCode = 400, details) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
    static badRequest(message = 'Petición inválida', details) {
        return new AppError(message, 400, details);
    }
    static unauthorized(message = 'No autorizado') {
        return new AppError(message, 401);
    }
    static forbidden(message = 'Acceso prohibido') {
        return new AppError(message, 403);
    }
    static notFound(message = 'Recurso no encontrado') {
        return new AppError(message, 404);
    }
    static conflict(message = 'Conflicto con el estado actual del recurso') {
        return new AppError(message, 409);
    }
    static internal(message = 'Error interno del servidor') {
        return new AppError(message, 500);
    }
}
exports.AppError = AppError;
