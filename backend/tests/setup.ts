import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { prisma } from '../src/config/database'; // Adjust path if needed

jest.mock('../src/config/database', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
  default: mockDeep<PrismaClient>(),
}));

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});
