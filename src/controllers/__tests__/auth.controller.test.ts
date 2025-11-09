import { signup, signin, signout, me } from '../auth.controller';
import type { AuthRequest } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
import { createMockResponse, createAuthRequest } from '../../test/httpMocks';
import { resetMockPrisma, MockPrismaClient } from '../../test/prismaMock';

jest.mock('../../lib/prisma', () => {
  const { createMockPrisma } = require('../../test/prismaMock');
  return {
    __esModule: true,
    default: createMockPrisma(),
  };
});

jest.mock('../../utils/password', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

jest.mock('../../utils/jwt', () => ({
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
}));

import prisma from '../../lib/prisma';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateToken } from '../../utils/jwt';

const prismaMock = prisma as unknown as MockPrismaClient;
const hashPasswordMock = hashPassword as jest.MockedFunction<typeof hashPassword>;
const comparePasswordMock = comparePassword as jest.MockedFunction<typeof comparePassword>;
const generateTokenMock = generateToken as jest.MockedFunction<typeof generateToken>;

describe('auth.controller', () => {
  beforeEach(() => {
    resetMockPrisma(prismaMock);
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('creates a new user and issues a token', async () => {
      const req = createAuthRequest({
        body: {
          email: 'new@example.com',
          password: 'password123',
          name: 'New User',
        },
      });
      const res = createMockResponse();

      prismaMock.user.findUnique.mockResolvedValue(null);
      hashPasswordMock.mockResolvedValue('hashed-password');
      prismaMock.user.create.mockResolvedValue({
        id: 1,
        email: 'new@example.com',
        password: 'hashed-password',
        name: 'New User',
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
      });
      generateTokenMock.mockReturnValue('token');

      await signup(req as AuthRequest, res as any);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: 'new@example.com' } });
      expect(hashPasswordMock).toHaveBeenCalledWith('password123');
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          email: 'new@example.com',
          password: 'hashed-password',
          name: 'New User',
        },
      });
      expect(generateTokenMock).toHaveBeenCalledWith({ userId: 1, email: 'new@example.com' });
      expect(res.cookie).toHaveBeenCalledWith(
        'token',
        'token',
        expect.objectContaining({ httpOnly: true })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        user: {
          id: 1,
          email: 'new@example.com',
          name: 'New User',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        token: 'token',
      });
    });

    it('throws an error when user already exists', async () => {
      const req = createAuthRequest({
        body: {
          email: 'existing@example.com',
          password: 'password123',
        },
      });
      const res = createMockResponse();

      prismaMock.user.findUnique.mockResolvedValue({ id: 1 });

      await expect(signup(req as AuthRequest, res as any)).rejects.toMatchObject({
        message: 'User with this email already exists',
        statusCode: 400,
      });
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it('wraps unexpected errors in AppError', async () => {
      const req = createAuthRequest({
        body: {
          email: 'fail@example.com',
          password: 'password123',
        },
      });
      const res = createMockResponse();

      prismaMock.user.findUnique.mockResolvedValue(null);
      hashPasswordMock.mockResolvedValue('hashed');
      prismaMock.user.create.mockRejectedValue(new Error('DB down'));

      await expect(signup(req as AuthRequest, res as any)).rejects.toMatchObject({
        message: 'Failed to create user',
        statusCode: 500,
      });
    });
  });

  describe('signin', () => {
    it('authenticates user and returns token', async () => {
      const req = createAuthRequest({
        body: {
          email: 'user@example.com',
          password: 'password123',
        },
      });
      const res = createMockResponse();

      prismaMock.user.findUnique.mockResolvedValue({
        id: 2,
        email: 'user@example.com',
        password: 'hashed',
        name: 'User',
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
      });
      comparePasswordMock.mockResolvedValue(true);
      generateTokenMock.mockReturnValue('jwt-token');

      await signin(req as AuthRequest, res as any);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: 'user@example.com' } });
      expect(comparePasswordMock).toHaveBeenCalledWith('password123', 'hashed');
      expect(res.cookie).toHaveBeenCalledWith('token', 'jwt-token', expect.any(Object));
      expect(res.json).toHaveBeenCalledWith({
        user: {
          id: 2,
          email: 'user@example.com',
          name: 'User',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        token: 'jwt-token',
      });
    });

    it('throws when user does not exist', async () => {
      const req = createAuthRequest({
        body: {
          email: 'missing@example.com',
          password: 'password123',
        },
      });
      const res = createMockResponse();

      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(signin(req as AuthRequest, res as any)).rejects.toMatchObject({
        message: 'Invalid email or password',
        statusCode: 401,
      });
    });

    it('throws when password is incorrect', async () => {
      const req = createAuthRequest({
        body: {
          email: 'user@example.com',
          password: 'wrong',
        },
      });
      const res = createMockResponse();

      prismaMock.user.findUnique.mockResolvedValue({
        id: 3,
        email: 'user@example.com',
        password: 'hashed',
        name: null,
        createdAt: new Date(),
      });
      comparePasswordMock.mockResolvedValue(false);

      await expect(signin(req as AuthRequest, res as any)).rejects.toMatchObject({
        message: 'Invalid email or password',
        statusCode: 401,
      });
    });

    it('wraps unexpected errors', async () => {
      const req = createAuthRequest({
        body: {
          email: 'user@example.com',
          password: 'password123',
        },
      });
      const res = createMockResponse();

      prismaMock.user.findUnique.mockResolvedValue({
        id: 4,
        email: 'user@example.com',
        password: 'hashed',
        name: 'User',
        createdAt: new Date(),
      });
      comparePasswordMock.mockRejectedValue(new Error('bcrypt error'));

      await expect(signin(req as AuthRequest, res as any)).rejects.toMatchObject({
        message: 'Failed to sign in',
        statusCode: 500,
      });
    });
  });

  describe('signout', () => {
    it('clears auth cookie', async () => {
      const req = createAuthRequest();
      const res = createMockResponse();

      await signout(req as AuthRequest, res as any);

      expect(res.clearCookie).toHaveBeenCalledWith('token');
      expect(res.json).toHaveBeenCalledWith({ message: 'Signed out successfully' });
    });
  });

  describe('me', () => {
    it('returns user profile', async () => {
      const req = createAuthRequest({
        user: { userId: 1, email: 'user@example.com' },
      });
      const res = createMockResponse();

      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        name: 'User',
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
      });

      await me(req as AuthRequest, res as any);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });
      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        email: 'user@example.com',
        name: 'User',
        createdAt: '2025-01-01T00:00:00.000Z',
      });
    });

    it('throws when request is not authenticated', async () => {
      const req = createAuthRequest();
      const res = createMockResponse();

      const promise = me(req as AuthRequest, res as any);

      await expect(promise).rejects.toBeInstanceOf(AppError);
      await expect(promise).rejects.toMatchObject({
        message: 'Not authenticated',
        statusCode: 401,
      });
    });

    it('throws when user is missing', async () => {
      const req = createAuthRequest({ user: { userId: 42, email: 'ghost@example.com' } });
      const res = createMockResponse();

      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(me(req as AuthRequest, res as any)).rejects.toMatchObject({
        message: 'User not found',
        statusCode: 404,
      });
    });

    it('wraps unexpected errors', async () => {
      const req = createAuthRequest({ user: { userId: 1, email: 'user@example.com' } });
      const res = createMockResponse();

      prismaMock.user.findUnique.mockRejectedValue(new Error('db error'));

      await expect(me(req as AuthRequest, res as any)).rejects.toMatchObject({
        message: 'Failed to get user profile',
        statusCode: 500,
      });
    });
  });
});
