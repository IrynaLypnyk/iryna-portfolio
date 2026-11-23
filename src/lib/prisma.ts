import { Pool } from 'pg';
import { attachDatabasePool } from '@vercel/functions';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

function createPrismaClient() {
  // Each serverless instance owns its pool. Keep it small and release idle
  // connections before Vercel suspends the instance.
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    max: 2,
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 10_000,
  });
  attachDatabasePool(pool);
  const adapter = new PrismaPg(pool, { disposeExternalPool: true });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// A regenerated client has a new constructor. Do not retain the old schema
// through a development hot reload.
const cachedPrisma = globalForPrisma.prisma;
export const prisma = cachedPrisma instanceof PrismaClient ? cachedPrisma : createPrismaClient();

if (cachedPrisma && cachedPrisma !== prisma) {
  void cachedPrisma.$disconnect();
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
