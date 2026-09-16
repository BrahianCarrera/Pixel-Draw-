"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("../generated/prisma/client");
const env_js_1 = require("./env.js");
const globalForPrisma = globalThis;
function makePrismaClient() {
    const adapter = new adapter_pg_1.PrismaPg({ connectionString: env_js_1.env.DATABASE_URL });
    return new client_1.PrismaClient({
        adapter,
        log: process.env.PRISMA_DEBUG === 'true'
            ? ['query', 'error', 'warn']
            : env_js_1.env.NODE_ENV === 'development'
                ? ['error', 'warn']
                : ['error'],
    });
}
exports.prisma = globalForPrisma.prisma ?? makePrismaClient();
if (env_js_1.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.prisma;
}
