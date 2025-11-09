import { getTasks, createTask, updateTask, deleteTask } from '../task.controller';
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

describe('task.controller', () => {
  const user = { userId: 1, email: 'user@example.com' };

  beforeEach(() => {
    resetMockPrisma(prismaMock);
    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    it('returns tasks for list', async () => {
      const req = createAuthRequest({ user, params: { listId: '50' } });
      const res = createMockResponse();

      prismaMock.list.findFirst.mockResolvedValue({
        id: 50,
        board: { ownerId: 1 },
      });
      prismaMock.task.findMany.mockResolvedValue([
        {
          id: 60,
          listId: 50,
          title: 'Task',
          description: 'Desc',
          position: 0,
          createdAt: new Date('2025-01-01T00:00:00.000Z'),
        },
      ]);

      await getTasks(req, res as any);

      expect(prismaMock.task.findMany).toHaveBeenCalledWith({
        where: { listId: 50 },
        orderBy: { position: 'asc' },
      });
      expect(res.json).toHaveBeenCalledWith([
        {
          id: 60,
          listId: 50,
          title: 'Task',
          description: 'Desc',
          position: 0,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ]);
    });

    it('throws when list missing or unauthorized', async () => {
      const req = createAuthRequest({ user, params: { listId: '50' } });
      const res = createMockResponse();

      prismaMock.list.findFirst.mockResolvedValue(null);

      await expect(getTasks(req, res as any)).rejects.toMatchObject({
        message: 'List not found',
        statusCode: 404,
      });
    });

    it('wraps unexpected errors', async () => {
      const req = createAuthRequest({ user, params: { listId: '50' } });
      const res = createMockResponse();

      prismaMock.list.findFirst.mockResolvedValue({ id: 50, board: { ownerId: 1 } });
      prismaMock.task.findMany.mockRejectedValue(new Error('db error'));

      await expect(getTasks(req, res as any)).rejects.toMatchObject({
        message: 'Failed to fetch tasks',
        statusCode: 500,
      });
    });
  });

  describe('createTask', () => {
    it('creates a task within a list', async () => {
      const req = createAuthRequest({
        user,
        params: { listId: '50' },
        body: { title: 'Task', description: 'Desc', position: 1 },
      });
      const res = createMockResponse();

      prismaMock.list.findFirst.mockResolvedValue({ id: 50, board: { ownerId: 1 } });
      prismaMock.task.create.mockResolvedValue({
        id: 60,
        listId: 50,
        title: 'Task',
        description: 'Desc',
        position: 1,
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
      });

      await createTask(req, res as any);

      expect(prismaMock.task.create).toHaveBeenCalledWith({
        data: {
          title: 'Task',
          description: 'Desc',
          position: 1,
          listId: 50,
        },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: 60,
        listId: 50,
        title: 'Task',
        description: 'Desc',
        position: 1,
        createdAt: '2025-01-01T00:00:00.000Z',
      });
    });

    it('throws when list missing', async () => {
      const req = createAuthRequest({ user, params: { listId: '50' }, body: { title: 'Task', position: 0 } });
      const res = createMockResponse();

      prismaMock.list.findFirst.mockResolvedValue(null);

      await expect(createTask(req, res as any)).rejects.toMatchObject({
        message: 'List not found',
        statusCode: 404,
      });
    });

    it('wraps unexpected errors', async () => {
      const req = createAuthRequest({ user, params: { listId: '50' }, body: { title: 'Task', position: 0 } });
      const res = createMockResponse();

      prismaMock.list.findFirst.mockResolvedValue({ id: 50, board: { ownerId: 1 } });
      prismaMock.task.create.mockRejectedValue(new Error('db error'));

      await expect(createTask(req, res as any)).rejects.toMatchObject({
        message: 'Failed to create task',
        statusCode: 500,
      });
    });
  });

  describe('updateTask', () => {
    it('updates task details', async () => {
      const req = createAuthRequest({
        user,
        params: { id: '60' },
        body: { title: 'Updated', description: 'Updated', position: 2 },
      });
      const res = createMockResponse();

      prismaMock.task.findFirst.mockResolvedValue({
        id: 60,
        listId: 50,
        list: { board: { ownerId: 1 } },
      });
      prismaMock.task.update.mockResolvedValue({
        id: 60,
        listId: 50,
        title: 'Updated',
        description: 'Updated',
        position: 2,
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
      });

      await updateTask(req, res as any);

      expect(prismaMock.task.update).toHaveBeenCalledWith({
        where: { id: 60 },
        data: {
          title: 'Updated',
          description: 'Updated',
          position: 2,
        },
      });
      expect(res.json).toHaveBeenCalledWith({
        id: 60,
        listId: 50,
        title: 'Updated',
        description: 'Updated',
        position: 2,
        createdAt: '2025-01-01T00:00:00.000Z',
      });
    });

    it('moves a task to another list after validation', async () => {
      const req = createAuthRequest({
        user,
        params: { id: '60' },
        body: { listId: 99, position: 0 },
      });
      const res = createMockResponse();

      prismaMock.task.findFirst.mockResolvedValue({
        id: 60,
        listId: 50,
        list: { board: { ownerId: 1 } },
      });
      prismaMock.list.findFirst.mockResolvedValue({
        id: 99,
        board: { ownerId: 1 },
      });
      prismaMock.task.update.mockResolvedValue({
        id: 60,
        listId: 99,
        title: 'Task',
        description: null,
        position: 0,
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
      });

      await updateTask(req, res as any);

      expect(prismaMock.list.findFirst).toHaveBeenCalledWith({
        where: { id: 99 },
        include: { board: { select: { ownerId: true } } },
      });
      expect(prismaMock.task.update).toHaveBeenCalledWith({
        where: { id: 60 },
        data: {
          listId: 99,
          position: 0,
        },
      });
    });

    it('throws when task not found', async () => {
      const req = createAuthRequest({ user, params: { id: '60' }, body: {} });
      const res = createMockResponse();

      prismaMock.task.findFirst.mockResolvedValue(null);

      await expect(updateTask(req, res as any)).rejects.toMatchObject({
        message: 'Task not found',
        statusCode: 404,
      });
    });

    it('throws when target list invalid', async () => {
      const req = createAuthRequest({ user, params: { id: '60' }, body: { listId: 99 } });
      const res = createMockResponse();

      prismaMock.task.findFirst.mockResolvedValue({
        id: 60,
        listId: 50,
        list: { board: { ownerId: 1 } },
      });
      prismaMock.list.findFirst.mockResolvedValue(null);

      await expect(updateTask(req, res as any)).rejects.toMatchObject({
        message: 'Target list not found',
        statusCode: 404,
      });
    });

    it('wraps unexpected errors', async () => {
      const req = createAuthRequest({ user, params: { id: '60' }, body: {} });
      const res = createMockResponse();

      prismaMock.task.findFirst.mockResolvedValue({ id: 60, listId: 50, list: { board: { ownerId: 1 } } });
      prismaMock.task.update.mockRejectedValue(new Error('db error'));

      await expect(updateTask(req, res as any)).rejects.toMatchObject({
        message: 'Failed to update task',
        statusCode: 500,
      });
    });
  });

  describe('deleteTask', () => {
    it('deletes task', async () => {
      const req = createAuthRequest({ user, params: { id: '60' } });
      const res = createMockResponse();

      prismaMock.task.findFirst.mockResolvedValue({
        id: 60,
        list: { board: { ownerId: 1 } },
      });

      await deleteTask(req, res as any);

      expect(prismaMock.task.delete).toHaveBeenCalledWith({ where: { id: 60 } });
      expect(res.json).toHaveBeenCalledWith({ message: 'Task deleted successfully' });
    });

    it('throws when task missing', async () => {
      const req = createAuthRequest({ user, params: { id: '60' } });
      const res = createMockResponse();

      prismaMock.task.findFirst.mockResolvedValue(null);

      await expect(deleteTask(req, res as any)).rejects.toMatchObject({
        message: 'Task not found',
        statusCode: 404,
      });
    });

    it('wraps unexpected errors', async () => {
      const req = createAuthRequest({ user, params: { id: '60' } });
      const res = createMockResponse();

      prismaMock.task.findFirst.mockResolvedValue({ id: 60, list: { board: { ownerId: 1 } } });
      prismaMock.task.delete.mockRejectedValue(new Error('db error'));

      await expect(deleteTask(req, res as any)).rejects.toMatchObject({
        message: 'Failed to delete task',
        statusCode: 500,
      });
    });
  });
});
