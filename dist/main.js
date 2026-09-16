"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = require("./app.js");
const env_js_1 = require("./config/env.js");
const prisma_js_1 = require("./config/prisma.js");
const startServer = async () => {
    const app = (0, app_js_1.createApp)();
    const server = app.listen(env_js_1.env.PORT, () => {
        console.info(`🚀 PixelDraw Backend corriendo en http://localhost:${env_js_1.env.PORT}`);
        console.info(`📡 Entorno: ${env_js_1.env.NODE_ENV}`);
        console.info(`🩺 Health Check: http://localhost:${env_js_1.env.PORT}/api/v1/health`);
    });
    // Manejo de apagado graceful
    const gracefulShutdown = async (signal) => {
        console.info(`\n🛑 Señal ${signal} recibida. Cerrando servidor de forma segura...`);
        server.close(async () => {
            await prisma_js_1.prisma.$disconnect();
            console.info('💾 Conexión con base de datos cerrada.');
            process.exit(0);
        });
    };
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};
startServer().catch(err => {
    console.error('❌ Error al iniciar el servidor:', err);
    process.exit(1);
});
