"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendCreated = exports.sendSuccess = void 0;
const sendSuccess = (res, data, message, statusCode = 200) => {
    const responsePayload = {
        success: true,
        ...(message && { message }),
        data,
    };
    return res.status(statusCode).json(responsePayload);
};
exports.sendSuccess = sendSuccess;
const sendCreated = (res, data, message = 'Recurso creado con éxito') => {
    return (0, exports.sendSuccess)(res, data, message, 201);
};
exports.sendCreated = sendCreated;
const sendError = (res, message = 'Error interno', statusCode = 500, error) => {
    const responsePayload = {
        success: false,
        message,
        ...(error !== undefined && { error }),
    };
    return res.status(statusCode).json(responsePayload);
};
exports.sendError = sendError;
