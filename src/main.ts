import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';

const startServer = async () => {
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.info(`🚀 PixelDraw Backend corriendo en http://localhost:${env.PORT}`);
    console.info(`📡 Entorno: ${env.NODE_ENV}`);
    console.info(`🩺 Health Check: http://localhost:${env.PORT}/api/v1/health`);
  });

  // Manejo de apagado graceful
  const gracefulShutdown = async (signal: string) => {
    console.info(`\n🛑 Señal ${signal} recibida. Cerrando servidor de forma segura...`);
    server.close(async () => {
      await prisma.$disconnect();
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
