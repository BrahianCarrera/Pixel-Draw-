"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const appError_js_1 = require("../utils/appError.js");
const notFound = (req, _res, next) => {
    next(appError_js_1.AppError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
};
exports.notFound = notFound;
