import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { env } from './env.js';

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof makePrismaClient> | undefined;
};

function makePrismaClient() {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  return new PrismaClient({
    adapter,
    log:
      process.env.PRISMA_DEBUG === 'true'
        ? ['query', 'error', 'warn']
        : env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? makePrismaClient();

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

