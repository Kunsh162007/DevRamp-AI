import { PrismaClient } from '@prisma/client';

const logger = console;

// Singleton pattern for Prisma Client
let prismaInstance: PrismaClient;

export const getPrismaClient = (): PrismaClient => {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'warn', emit: 'event' },
      ],
    });

    // Log queries in development
    if (process.env.NODE_ENV === 'development') {
      prismaInstance.$on('query' as never, (e: any) => {
        logger.debug('Query: ' + e.query);
        logger.debug('Duration: ' + e.duration + 'ms');
      });
    }

    // Log errors
    prismaInstance.$on('error' as never, (e: any) => {
      logger.error('Prisma Error:', e);
    });

    // Log warnings
    prismaInstance.$on('warn' as never, (e: any) => {
      logger.warn('Prisma Warning:', e);
    });
  }

  return prismaInstance;
};

// Graceful shutdown
export const disconnectDatabase = async (): Promise<void> => {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    logger.info('Database disconnected');
  }
};

// Health check
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    const client = getPrismaClient();
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
};

export default getPrismaClient;
export const prisma = getPrismaClient();

// Made with Bob
