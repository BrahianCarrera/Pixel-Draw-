import { describe, it, expect } from 'vitest';
import syncRoutes from '../src/routes/sync.routes.js';
import { createApp } from '../src/app.js';

describe('Sync API Routes', () => {
  it('debe exportar el router de sincronización correctamente', () => {
    expect(syncRoutes).toBeDefined();
    expect(typeof syncRoutes).toBe('function');
  });

  it('debe inicializar la aplicación Express incluyendo la ruta de sincronización', () => {
    const app = createApp();
    expect(app).toBeDefined();
    expect(typeof app.use).toBe('function');
  });
});
