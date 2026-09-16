"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const auth_service_js_1 = require("../services/auth.service.js");
const response_js_1 = require("../utils/response.js");
const appError_js_1 = require("../utils/appError.js");
const register = async (req, res, next) => {
    try {
        const result = await auth_service_js_1.authService.register(req.body);
        (0, response_js_1.sendCreated)(res, result, 'Usuario registrado e identificado con éxito');
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const result = await auth_service_js_1.authService.login(req.body);
        (0, response_js_1.sendSuccess)(res, result, 'Inicio de sesión exitoso');
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const getMe = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            throw appError_js_1.AppError.unauthorized('No autenticado');
        }
        const user = await auth_service_js_1.authService.getMe(req.user.id);
        (0, response_js_1.sendSuccess)(res, user, 'Datos de usuario y perfil de pareja obtenidos con éxito');
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
