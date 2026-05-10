import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/auth';
import { prismaMock } from '../setup';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword',
        role: 'USER' as any,
        level: 'BEGINNER' as any,
        xp: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        avatar: null
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should fail if email already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        name: 'Existing User',
        password: 'hashedpassword',
        role: 'USER' as any,
        level: 'BEGINNER' as any,
        xp: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        avatar: null
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          name: 'Existing User',
          password: 'password123'
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error', 'Email already registered');
    });
  });

  describe('POST /auth/login', () => {
    it('should login a user successfully', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      prismaMock.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
        role: 'USER' as any,
        level: 'BEGINNER' as any,
        xp: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        avatar: null
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should fail with invalid credentials', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'notfound@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });
});
