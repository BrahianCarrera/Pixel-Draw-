"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const index_js_1 = __importDefault(require("./routes/index.js"));
const errorHandler_js_1 = require("./middlewares/errorHandler.js");
const notFound_js_1 = require("./middlewares/notFound.js");
const env_js_1 = require("./config/env.js");
const createApp = () => {
    const app = (0, express_1.default)();
    // Middlewares básicos
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    // CORS Middleware
    app.use((req, res, next) => {
        const origin = req.headers.origin;
        const allowedOrigins = env_js_1.env.CORS_ORIGIN
            ? env_js_1.env.CORS_ORIGIN.split(',').map(o => o.trim())
            : ['*'];
        if (allowedOrigins.includes('*')) {
            res.header('Access-Control-Allow-Origin', '*');
        }
        else if (origin && allowedOrigins.includes(origin)) {
            res.header('Access-Control-Allow-Origin', origin);
            res.header('Vary', 'Origin');
        }
        else if (env_js_1.env.NODE_ENV === 'development') {
            res.header('Access-Control-Allow-Origin', origin || '*');
            res.header('Vary', 'Origin');
        }
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        if (req.method === 'OPTIONS') {
            res.sendStatus(204);
            return;
        }
        next();
    });
    // Ruta raíz de bienvenida
    app.get('/', (_req, res) => {
        res.json({
            name: 'PixelDraw API',
            status: 'online',
            version: '1.0.0',
            documentation: '/api/v1/health',
        });
    });
    // Rutas API v1
    app.use('/api/v1', index_js_1.default);
    // Manejador 404
    app.use(notFound_js_1.notFound);
    // Manejador global de errores
    app.use(errorHandler_js_1.errorHandler);
    return app;
};
exports.createApp = createApp;
