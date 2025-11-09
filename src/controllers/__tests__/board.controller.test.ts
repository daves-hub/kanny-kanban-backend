import {
  getAllBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
} from '../board.controller';
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

describe('board.controller', () => {
  const user = { userId: 1, email: 'user@example.com' };

  beforeEach(() => {
    resetMockPrisma(prismaMock);
    jest.clearAllMocks();
  });

  describe('getAllBoards', () => {
    it('returns boards for user optionally filtered by project', async () => {
      const req = createAuthRequest({ user, query: { projectId: '2' } });
      const res = createMockResponse();

      prismaMock.board.findMany.mockResolvedValue([
        {
          id: 10,
          name: 'Board',
          ownerId: 1,
          projectId: 2,
          createdAt: new Date('2025-01-01T00:00:00.000Z'),
          updatedAt: new Date('2025-01-02T00:00:00.000Z'),
        },
      ]);

      await getAllBoards(req, res as any);

      expect(prismaMock.board.findMany).toHaveBeenCalledWith({
        where: {
          ownerId: 1,
          projectId: 2,
        },
        orderBy: { updatedAt: 'desc' },
      });

      expect(res.json).toHaveBeenCalledWith([
        {
          id: 10,
          name: 'Board',
          ownerId: 1,
          projectId: 2,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-02T00:00:00.000Z',
        },
      ]);
    });

    it('returns boards without project filter', async () => {
      const req = createAuthRequest({ user, query: {} });
      const res = createMockResponse();

      prismaMock.board.findMany.mockResolvedValue([]);

      await getAllBoards(req, res as any);

      expect(prismaMock.board.findMany).toHaveBeenCalledWith({
        where: {
          ownerId: 1,
        },
        orderBy: { updatedAt: 'desc' },
      });
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('throws when unauthenticated', async () => {
      const req = createAuthRequest();
      const res = createMockResponse();

      await expect(getAllBoards(req, res as any)).rejects.toMatchObject({
        message: 'Not authenticated',
        statusCode: 401,
      });
    });

    it('wraps unexpected errors', async () => {
      const req = createAuthRequest({ user });
      const res = createMockResponse();

      prismaMock.board.findMany.mockRejectedValue(new Error('db error'));

      await expect(getAllBoards(req, res as any)).rejects.toMatchObject({
        message: 'Failed to fetch boards',
        statusCode: 500,
      });
    });
  });

  describe('getBoard', () => {
    it('returns full board with lists and tasks', async () => {
      const req = createAuthRequest({ user, params: { id: '10' } });
      const res = createMockResponse();

      prismaMock.board.findFirst.mockResolvedValue({
        id: 10,
        name: 'Board',
        ownerId: 1,
        projectId: 2,
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
        updatedAt: new Date('2025-01-01T05:00:00.000Z'),
        lists: [
          {
            id: 20,
            boardId: 10,
            title: 'Todo',
            position: 0,
            createdAt: new Date('2025-01-01T01:00:00.000Z'),
            tasks: [
              {
                id: 30,
                listId: 20,
                title: 'Task',
                description: 'Desc',
                position: 0,
                createdAt: new Date('2025-01-01T02:00:00.000Z'),
              },
            ],
          },
        ],
      });

      await getBoard(req, res as any);

      expect(prismaMock.board.findFirst).toHaveBeenCalledWith({
        where: { id: 10, ownerId: 1 },
        include: {
          lists: {
            orderBy: { position: 'asc' },
            include: {
              tasks: {
                orderBy: { position: 'asc' },
              },
            },
          },
        },
      });

      expect(res.json).toHaveBeenCalledWith({
        id: 10,
        name: 'Board',
        ownerId: 1,
        projectId: 2,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T05:00:00.000Z',
        lists: [
          {
            id: 20,
            boardId: 10,
            title: 'Todo',
            position: 0,
            createdAt: '2025-01-01T01:00:00.000Z',
            tasks: [
              {
                id: 30,
                listId: 20,
                title: 'Task',
                description: 'Desc',
                position: 0,
                createdAt: '2025-01-01T02:00:00.000Z',
              },
            ],
          },
        ],
      });
    });

    it('throws when board is missing', async () => {
      const req = createAuthRequest({ user, params: { id: '10' } });
      const res = createMockResponse();

      prismaMock.board.findFirst.mockResolvedValue(null);

      await expect(getBoard(req, res as any)).rejects.toMatchObject({
        message: 'Board not found',
        statusCode: 404,
      });
    });

    it('wraps unexpected errors', async () => {
      const req = createAuthRequest({ user, params: { id: '10' } });
      const res = createMockResponse();

      prismaMock.board.findFirst.mockRejectedValue(new Error('db error'));

      await expect(getBoard(req, res as any)).rejects.toMatchObject({
        message: 'Failed to fetch board',
        statusCode: 500,
      });
    });
  });

  describe('createBoard', () => {
    it('creates board and default lists when standalone', async () => {
      const req = createAuthRequest({ user, body: { name: 'Board' } });
      const res = createMockResponse();

      const createdBoard = {
        id: 10,
        name: 'Board',
        ownerId: 1,
        projectId: null,
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
        updatedAt: new Date('2025-01-01T00:00:00.000Z'),
      };

      prismaMock.board.create.mockResolvedValue(createdBoard);
      prismaMock.list.createMany.mockResolvedValue({} as any);
      prismaMock.list.findMany.mockResolvedValue([
        {
          id: 20,
          boardId: 10,
          title: 'Todo',
          position: 0,
          createdAt: new Date('2025-01-01T00:00:00.000Z'),
        },
      ]);

      await createBoard(req, res as any);

      expect(prismaMock.project.findFirst).not.toHaveBeenCalled();
      expect(prismaMock.board.create).toHaveBeenCalledWith({
        data: {
          name: 'Board',
          projectId: null,
          ownerId: 1,
        },
      });
      expect(prismaMock.list.createMany).toHaveBeenCalledWith({
        data: [
          { title: 'Todo', position: 0, boardId: 10 },
          { title: 'In Progress', position: 1, boardId: 10 },
          { title: 'Complete', position: 2, boardId: 10 },
        ],
      });
      expect(prismaMock.list.findMany).toHaveBeenCalledWith({
        where: { boardId: 10 },
        orderBy: { position: 'asc' },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: 10,
        name: 'Board',
        ownerId: 1,
        projectId: null,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        lists: [
          {
            id: 20,
            boardId: 10,
            title: 'Todo',
            position: 0,
            createdAt: '2025-01-01T00:00:00.000Z',
          },
        ],
      });
    });

    it('validates project ownership when projectId is provided', async () => {
      const req = createAuthRequest({ user, body: { name: 'Board', projectId: 2 } });
      const res = createMockResponse();

      prismaMock.project.findFirst.mockResolvedValue({ id: 2, ownerId: 1 });
      prismaMock.board.create.mockResolvedValue({
        id: 11,
        name: 'Board',
        ownerId: 1,
        projectId: 2,
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
        updatedAt: new Date('2025-01-01T00:00:00.000Z'),
      });
      prismaMock.list.createMany.mockResolvedValue({} as any);
      prismaMock.list.findMany.mockResolvedValue([]);

      await createBoard(req, res as any);

      expect(prismaMock.project.findFirst).toHaveBeenCalledWith({
        where: { id: 2, ownerId: 1 },
      });
    });

    it('throws when project not found', async () => {
      const req = createAuthRequest({ user, body: { name: 'Board', projectId: 99 } });
      const res = createMockResponse();

      prismaMock.project.findFirst.mockResolvedValue(null);

      await expect(createBoard(req, res as any)).rejects.toMatchObject({
        message: 'Project not found',
        statusCode: 404,
      });
      expect(prismaMock.board.create).not.toHaveBeenCalled();
    });

    it('throws when unauthenticated', async () => {
      const req = createAuthRequest({ body: { name: 'Board' } });
      const res = createMockResponse();

      await expect(createBoard(req, res as any)).rejects.toMatchObject({
        message: 'Not authenticated',
        statusCode: 401,
      });
    });

    it('wraps unexpected errors', async () => {
      const req = createAuthRequest({ user, body: { name: 'Board' } });
      const res = createMockResponse();

      prismaMock.board.create.mockRejectedValue(new Error('db error'));

      await expect(createBoard(req, res as any)).rejects.toMatchObject({
        message: 'Failed to create board',
        statusCode: 500,
      });
    });
  });

  describe('updateBoard', () => {
    it('updates board fields', async () => {
      const req = createAuthRequest({
        user,
        params: { id: '10' },
        body: { name: 'Updated', projectId: null },
      });
      const res = createMockResponse();

      prismaMock.board.findFirst.mockResolvedValue({ id: 10 });
      prismaMock.board.update.mockResolvedValue({
        id: 10,
        name: 'Updated',
        ownerId: 1,
        projectId: null,
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
        updatedAt: new Date('2025-01-02T00:00:00.000Z'),
      });

      await updateBoard(req, res as any);

      expect(prismaMock.board.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: {
          name: 'Updated',
          projectId: null,
        },
      });
      expect(res.json).toHaveBeenCalledWith({
        id: 10,
        name: 'Updated',
        ownerId: 1,
        projectId: null,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-02T00:00:00.000Z',
      });
    });

    it('validates project ownership when changing project', async () => {
      const req = createAuthRequest({
        user,
        params: { id: '10' },
        body: { projectId: 5 },
      });
      const res = createMockResponse();

      prismaMock.board.findFirst.mockResolvedValue({ id: 10 });
      prismaMock.project.findFirst.mockResolvedValue(null);

      await expect(updateBoard(req, res as any)).rejects.toMatchObject({
        message: 'Project not found',
        statusCode: 404,
      });
    });

    it('throws when board is missing', async () => {
      const req = createAuthRequest({ user, params: { id: '10' }, body: {} });
      const res = createMockResponse();

      prismaMock.board.findFirst.mockResolvedValue(null);

      await expect(updateBoard(req, res as any)).rejects.toMatchObject({
        message: 'Board not found',
        statusCode: 404,
      });
    });

    it('wraps unexpected errors', async () => {
      const req = createAuthRequest({ user, params: { id: '10' }, body: {} });
      const res = createMockResponse();

      prismaMock.board.findFirst.mockResolvedValue({ id: 10 });
      prismaMock.board.update.mockRejectedValue(new Error('db error'));

      await expect(updateBoard(req, res as any)).rejects.toMatchObject({
        message: 'Failed to update board',
        statusCode: 500,
      });
    });
  });

  describe('deleteBoard', () => {
    it('deletes the board', async () => {
      const req = createAuthRequest({ user, params: { id: '10' } });
      const res = createMockResponse();

      prismaMock.board.findFirst.mockResolvedValue({ id: 10 });

      await deleteBoard(req, res as any);

      expect(prismaMock.board.delete).toHaveBeenCalledWith({ where: { id: 10 } });
      expect(res.json).toHaveBeenCalledWith({ message: 'Board deleted successfully' });
    });

    it('throws when board is missing', async () => {
      const req = createAuthRequest({ user, params: { id: '10' } });
      const res = createMockResponse();

      prismaMock.board.findFirst.mockResolvedValue(null);

      await expect(deleteBoard(req, res as any)).rejects.toMatchObject({
        message: 'Board not found',
        statusCode: 404,
      });
    });

    it('wraps unexpected errors', async () => {
      const req = createAuthRequest({ user, params: { id: '10' } });
      const res = createMockResponse();

      prismaMock.board.findFirst.mockResolvedValue({ id: 10 });
      prismaMock.board.delete.mockRejectedValue(new Error('db error'));

      await expect(deleteBoard(req, res as any)).rejects.toMatchObject({
        message: 'Failed to delete board',
        statusCode: 500,
      });
    });
  });
});
