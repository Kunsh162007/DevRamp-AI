import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Singleton pattern for Prisma Client
let prisma: PrismaClient;

export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'warn', emit: 'event' },
      ],
    });

    // Log queries in development
    if (process.env.NODE_ENV === 'development') {
      prisma.$on('query' as never, (e: any) => {
        logger.debug('Query: ' + e.query);
        logger.debug('Duration: ' + e.duration + 'ms');
      });
    }

    // Log errors
    prisma.$on('error' as never, (e: any) => {
      logger.error('Prisma Error:', e);
    });

    // Log warnings
    prisma.$on('warn' as never, (e: any) => {
      logger.warn('Prisma Warning:', e);
    });
  }

  return prisma;
};

// Graceful shutdown
export const disconnectDatabase = async (): Promise<void> => {
  if (prisma) {
    await prisma.$disconnect();
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

// Made with Bob
