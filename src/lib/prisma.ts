import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// A regenerated client has a new constructor. Do not retain the old schema
// through a development hot reload.
const cachedPrisma = globalForPrisma.prisma;
export const prisma =
  cachedPrisma instanceof PrismaClient ? cachedPrisma : new PrismaClient({ adapter });

if (cachedPrisma && cachedPrisma !== prisma) {
  void cachedPrisma.$disconnect();
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
