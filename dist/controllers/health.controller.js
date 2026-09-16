"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealth = void 0;
const response_js_1 = require("../utils/response.js");
const getHealth = (_req, res) => {
    const healthData = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        service: 'pixeldraw-backend',
        version: '1.0.0',
    };
    (0, response_js_1.sendSuccess)(res, healthData, 'Servicio operativo');
};
exports.getHealth = getHealth;
