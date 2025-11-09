import { getLists, createList, updateList, deleteList } from '../list.controller';
import { createAuthRequest, createMockResponse } from '../../test/httpMocks';
import { resetMockPrisma, MockPrismaClient } from '../../test/prismaMock';

jest.mock('../../lib/prisma', () => {
  const { createMockPrisma } = require('../../test/prismaMock');
  return {
    __esModule: true,
    default: createMockPrisma(),
  };
});

import prisma from '../../lib/prisma';

const prismaMock = prisma as unknown as MockPrismaClient;

describe('list.controller', () => {
  const user = { userId: 1, email: 'user@example.com' };

  beforeEach(() => {
    resetMockPrisma(prismaMock);
    jest.clearAllMocks();
  });

  describe('getLists', () => {
    it('returns lists for a board', async () => {
      const req = createAuthRequest({ user, params: { boardId: '10' } });
      const res = createMockResponse();

      prismaMock.board.findFirst.mockResolvedValue({ id: 10 });
      prismaMock.list.findMany.mockResolvedValue([
        {
          id: 20,
          boardId: 10,
          title: 'Todo',
          position: 0,
          createdAt: new Date('2025-01-01T00:00:00.000Z'),
        },
      ]);

      await getLists(req, res as any);

      expect(prismaMock.board.findFirst).toHaveBeenCalledWith({
        where: { id: 10, ownerId: 1 },
      });
      expect(res.json).toHaveBeenCalledWith([
        {
          id: 20,
          boardId: 10,
          title: 'Todo',
          position: 0,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ]);
    });

    it('throws when board is missing', async () => {
      const req = createAuthRequest({ user, params: { boardId: '10' } });
      const res = createMockResponse();

      prismaMock.board.findFirst.mockResolvedValue(null);

      await expect(getLists(req, res as any)).rejects.toMatchObject({
        message: 'Board not found',
        statusCode: 404,
      });
    });

    it('throws when unauthenticated', async () => {
      const req = createAuthRequest({ params: { boardId: '10' } });
      const res = createMockResponse();

      await expect(getLists(req, res as any)).rejects.toMatchObject({
        message: 'Not authenticated',
        statusCode: 401,
      });
    });

    it('wraps unexpected errors', async () => {
      const req = createAuthRequest({ user, params: { boardId: '10' } });
      const res = createMockResponse();

      prismaMock.board.findFirst.mockResolvedValue({ id: 10 });
      prismaMock.list.findMany.mockRejectedValue(new Error('db error'));

      await expect(getLists(req, res as any)).rejects.toMatchObject({
        message: 'Failed to fetch lists',
        statusCode: 500,
      });
    });
  });

  describe('createList', () => {
    it('creates list under board', async () => {
      const req = createAuthRequest({
        user,
        params: { boardId: '10' },
        body: { title: 'Review', position: 3 },
      });
      const res = createMockResponse();

      prismaMock.board.findFirst.mockResolvedValue({ id: 10 });
      prismaMock.list.create.mockResolvedValue({
        id: 30,
        boardId: 10,
        title: 'Review',
        position: 3,
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
      });

      await createList(req, res as any);

      expect(prismaMock.list.create).toHaveBeenCalledWith({
        data: {
          title: 'Review',
          position: 3,
          boardId: 10,
        },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: 30,
        boardId: 10,
        title: 'Review',
        position: 3,
        createdAt: '2025-01-01T00:00:00.000Z',
      });
    });

    it('throws when board missing', async () => {
      const req = createAuthRequest({ user, params: { boardId: '10' }, body: {} });
      const res = createMockResponse();

      prismaMock.board.findFirst.mockResolvedValue(null);

      await expect(createList(req, res as any)).rejects.toMatchObject({
        message: 'Board not found',
        statusCode: 404,
      });
    });

    it('wraps unexpected errors', async () => {
      const req = createAuthRequest({ user, params: { boardId: '10' }, body: { title: 'Review', position: 3 } });
      const res = createMockResponse();

      prismaMock.board.findFirst.mockResolvedValue({ id: 10 });
      prismaMock.list.create.mockRejectedValue(new Error('db error'));

      await expect(createList(req, res as any)).rejects.toMatchObject({
        message: 'Failed to create list',
        statusCode: 500,
      });
    });
  });

  describe('updateList', () => {
    it('updates list data', async () => {
      const req = createAuthRequest({
        user,
        params: { id: '30' },
        body: { title: 'Updated', position: 1 },
      });
      const res = createMockResponse();

      prismaMock.list.findFirst.mockResolvedValue({
        id: 30,
        board: { ownerId: 1 },
      });
      prismaMock.list.update.mockResolvedValue({
        id: 30,
        boardId: 10,
        title: 'Updated',
        position: 1,
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
      });

      await updateList(req, res as any);

      expect(prismaMock.list.update).toHaveBeenCalledWith({
        where: { id: 30 },
        data: {
          title: 'Updated',
          position: 1,
        },
      });
      expect(res.json).toHaveBeenCalledWith({
        id: 30,
        boardId: 10,
        title: 'Updated',
        position: 1,
        createdAt: '2025-01-01T00:00:00.000Z',
      });
    });

    it('throws when list not found', async () => {
      const req = createAuthRequest({ user, params: { id: '30' }, body: {} });
      const res = createMockResponse();

      prismaMock.list.findFirst.mockResolvedValue(null);

      await expect(updateList(req, res as any)).rejects.toMatchObject({
        message: 'List not found',
        statusCode: 404,
      });
    });

    it('wraps unexpected errors', async () => {
      const req = createAuthRequest({ user, params: { id: '30' }, body: {} });
      const res = createMockResponse();

      prismaMock.list.findFirst.mockResolvedValue({ id: 30, board: { ownerId: 1 } });
      prismaMock.list.update.mockRejectedValue(new Error('db error'));

      await expect(updateList(req, res as any)).rejects.toMatchObject({
        message: 'Failed to update list',
        statusCode: 500,
      });
    });
  });

  describe('deleteList', () => {
    it('deletes list', async () => {
      const req = createAuthRequest({ user, params: { id: '30' } });
      const res = createMockResponse();

      prismaMock.list.findFirst.mockResolvedValue({ id: 30, board: { ownerId: 1 } });

      await deleteList(req, res as any);

      expect(prismaMock.list.delete).toHaveBeenCalledWith({ where: { id: 30 } });
      expect(res.json).toHaveBeenCalledWith({ message: 'List deleted successfully' });
    });

    it('throws when list missing', async () => {
      const req = createAuthRequest({ user, params: { id: '30' } });
      const res = createMockResponse();

      prismaMock.list.findFirst.mockResolvedValue(null);

      await expect(deleteList(req, res as any)).rejects.toMatchObject({
        message: 'List not found',
        statusCode: 404,
      });
    });

    it('wraps unexpected errors', async () => {
      const req = createAuthRequest({ user, params: { id: '30' } });
      const res = createMockResponse();

      prismaMock.list.findFirst.mockResolvedValue({ id: 30, board: { ownerId: 1 } });
      prismaMock.list.delete.mockRejectedValue(new Error('db error'));

      await expect(deleteList(req, res as any)).rejects.toMatchObject({
        message: 'Failed to delete list',
        statusCode: 500,
      });
    });
  });
});
