"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const auth_service_js_1 = require("../services/auth.service.js");
const appError_js_1 = require("../utils/appError.js");
const requireAuth = (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw appError_js_1.AppError.unauthorized('Se requiere autenticación. Proporcione un token Bearer');
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw appError_js_1.AppError.unauthorized('Token no proporcionado');
        }
        const decoded = auth_service_js_1.authService.verifyToken(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.requireAuth = requireAuth;
