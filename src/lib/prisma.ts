import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const prismaClientSingleton = () => {
  // For production, add connection pool parameters to the database URL
  const databaseUrl = process.env.NODE_ENV === 'production'
    ? `${process.env.DATABASE_URL}?connection_limit=10&pool_timeout=30`
    : process.env.DATABASE_URL;

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasourceUrl: databaseUrl
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Handle clean up on serverless environments
const cleanup = async () => {
  if (process.env.NODE_ENV === 'production') {
    await prisma.$disconnect();
  }
};

// Clean up on exit
process.on('exit', cleanup);
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

export default prisma;
