import { describe, it, expect } from 'vitest';
import { createApp } from '../src/app.js';

describe('Health Check API', () => {
  it('debe inicializar la aplicación Express sin errores', () => {
    const app = createApp();
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
  });
});
