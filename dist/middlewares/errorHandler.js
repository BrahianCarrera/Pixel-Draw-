"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const appError_js_1 = require("../utils/appError.js");
const env_js_1 = require("../config/env.js");
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof appError_js_1.AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err.details ? { details: err.details } : {}),
            ...(env_js_1.env.NODE_ENV === 'development' && { stack: err.stack }),
        });
        return;
    }
    // Prisma unique constraint error
    if ('code' in err && err.code === 'P2002') {
        res.status(409).json({
            success: false,
            message: 'Ya existe un registro con uno de los valores únicos proporcionados.',
            ...(env_js_1.env.NODE_ENV === 'development' && { stack: err.stack }),
        });
        return;
    }
    console.error('💥 Unhandled Error:', err);
    res.status(500).json({
        success: false,
        message: 'Ha ocurrido un error interno en el servidor.',
        ...(env_js_1.env.NODE_ENV === 'development' && {
            error: err.message,
            stack: err.stack,
        }),
    });
};
exports.errorHandler = errorHandler;
