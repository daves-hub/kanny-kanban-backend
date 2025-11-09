import {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '../project.controller';
import { AppError } from '../../middleware/errorHandler';
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

describe('project.controller', () => {
  const user = { userId: 1, email: 'user@example.com' };

  beforeEach(() => {
    resetMockPrisma(prismaMock);
    jest.clearAllMocks();
  });

  describe('getAllProjects', () => {
    it('returns projects for authenticated user', async () => {
      const req = createAuthRequest({ user });
      const res = createMockResponse();

      prismaMock.project.findMany.mockResolvedValue([
        {
          id: 1,
          name: 'Demo',
          description: 'Desc',
          ownerId: 1,
          createdAt: new Date('2025-01-01T00:00:00.000Z'),
          updatedAt: new Date('2025-01-02T00:00:00.000Z'),
          boards: [{ id: 10, name: 'Board 1' }],
        },
      ]);

      await getAllProjects(req, res as any);

      expect(prismaMock.project.findMany).toHaveBeenCalledWith({
        where: { ownerId: 1 },
        orderBy: { updatedAt: 'desc' },
        include: {
          boards: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      expect(res.json).toHaveBeenCalledWith([
        {
          id: 1,
          name: 'Demo',
          description: 'Desc',
          ownerId: 1,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-02T00:00:00.000Z',
          boards: [{ id: 10, name: 'Board 1' }],
        },
      ]);
    });

    it('throws when unauthenticated', async () => {
      const req = createAuthRequest();
      const res = createMockResponse();

      const promise = getAllProjects(req, res as any);

      await expect(promise).rejects.toBeInstanceOf(AppError);
      await expect(promise).rejects.toMatchObject({ message: 'Not authenticated', statusCode: 401 });
    });

    it('wraps unexpected errors', async () => {
      const req = createAuthRequest({ user });
      const res = createMockResponse();

      prismaMock.project.findMany.mockRejectedValue(new Error('db error'));

      await expect(getAllProjects(req, res as any)).rejects.toMatchObject({
        message: 'Failed to fetch projects',
        statusCode: 500,
      });
    });
  });

  describe('getProject', () => {
    it('returns a single project with boards', async () => {
      const req = createAuthRequest({ user, params: { id: '1' } });
      const res = createMockResponse();

      prismaMock.project.findFirst.mockResolvedValue({
        id: 1,
        name: 'Demo',
        description: 'Desc',
        ownerId: 1,
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
        updatedAt: new Date('2025-01-02T00:00:00.000Z'),
        boards: [
          {
            id: 10,
            name: 'Board 1',
            createdAt: new Date('2025-01-01T01:00:00.000Z'),
            updatedAt: new Date('2025-01-01T02:00:00.000Z'),
          },
        ],
      });

      await getProject(req, res as any);

      expect(prismaMock.project.findFirst).toHaveBeenCalledWith({
        where: { id: 1, ownerId: 1 },
        include: {
          boards: {
            select: {
              id: true,
              name: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        name: 'Demo',
        description: 'Desc',
        ownerId: 1,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-02T00:00:00.000Z',
        boards: [
          {
            id: 10,
            name: 'Board 1',
            createdAt: '2025-01-01T01:00:00.000Z',
            updatedAt: '2025-01-01T02:00:00.000Z',
          },
        ],
      });
    });

    it('throws when project is missing', async () => {
      const req = createAuthRequest({ user, params: { id: '1' } });
      const res = createMockResponse();

      prismaMock.project.findFirst.mockResolvedValue(null);

      await expect(getProject(req, res as any)).rejects.toMatchObject({
        message: 'Project not found',
        statusCode: 404,
      });
    });

    it('wraps unexpected errors', async () => {
      const req = createAuthRequest({ user, params: { id: '1' } });
      const res = createMockResponse();

      prismaMock.project.findFirst.mockRejectedValue(new Error('db error'));

      await expect(getProject(req, res as any)).rejects.toMatchObject({
        message: 'Failed to fetch project',
        statusCode: 500,
      });
    });
  });

  describe('createProject', () => {
    it('creates a project for the user', async () => {
      const req = createAuthRequest({
        user,
        body: { name: 'New Project', description: 'Optional' },
      });
      const res = createMockResponse();

      prismaMock.project.create.mockResolvedValue({
        id: 2,
        name: 'New Project',
        description: 'Optional',
        ownerId: 1,
        createdAt: new Date('2025-01-03T00:00:00.000Z'),
        updatedAt: new Date('2025-01-03T00:00:00.000Z'),
      });

      await createProject(req, res as any);

      expect(prismaMock.project.create).toHaveBeenCalledWith({
        data: {
          name: 'New Project',
          description: 'Optional',
          ownerId: 1,
        },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: 2,
        name: 'New Project',
        description: 'Optional',
        ownerId: 1,
        createdAt: '2025-01-03T00:00:00.000Z',
        updatedAt: '2025-01-03T00:00:00.000Z',
      });
    });

    it('throws when unauthenticated', async () => {
      const req = createAuthRequest({ body: { name: 'New' } });
      const res = createMockResponse();

      await expect(createProject(req, res as any)).rejects.toMatchObject({
        message: 'Not authenticated',
        statusCode: 401,
      });
    });

    it('wraps unexpected errors', async () => {
      const req = createAuthRequest({ user, body: { name: 'Fail' } });
      const res = createMockResponse();

      prismaMock.project.create.mockRejectedValue(new Error('db error'));

      await expect(createProject(req, res as any)).rejects.toMatchObject({
        message: 'Failed to create project',
        statusCode: 500,
      });
    });
  });

  describe('updateProject', () => {
    it('updates project details', async () => {
      const req = createAuthRequest({
        user,
        params: { id: '2' },
        body: { name: 'Updated', description: 'Updated desc' },
      });
      const res = createMockResponse();

      prismaMock.project.findFirst.mockResolvedValue({ id: 2 });
      prismaMock.project.update.mockResolvedValue({
        id: 2,
        name: 'Updated',
        description: 'Updated desc',
        ownerId: 1,
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
        updatedAt: new Date('2025-01-05T00:00:00.000Z'),
      });

      await updateProject(req, res as any);

      expect(prismaMock.project.findFirst).toHaveBeenCalledWith({
        where: { id: 2, ownerId: 1 },
      });
      expect(prismaMock.project.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: {
          name: 'Updated',
          description: 'Updated desc',
        },
      });
      expect(res.json).toHaveBeenCalledWith({
        id: 2,
        name: 'Updated',
        description: 'Updated desc',
        ownerId: 1,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-05T00:00:00.000Z',
      });
    });

    it('throws when project does not exist', async () => {
      const req = createAuthRequest({ user, params: { id: '2' }, body: {} });
      const res = createMockResponse();

      prismaMock.project.findFirst.mockResolvedValue(null);

      await expect(updateProject(req, res as any)).rejects.toMatchObject({
        message: 'Project not found',
        statusCode: 404,
      });
    });

    it('wraps unexpected errors', async () => {
      const req = createAuthRequest({ user, params: { id: '2' }, body: {} });
      const res = createMockResponse();

      prismaMock.project.findFirst.mockResolvedValue({ id: 2 });
      prismaMock.project.update.mockRejectedValue(new Error('db error'));

      await expect(updateProject(req, res as any)).rejects.toMatchObject({
        message: 'Failed to update project',
        statusCode: 500,
      });
    });
  });

  describe('deleteProject', () => {
    it('deletes the project', async () => {
      const req = createAuthRequest({ user, params: { id: '3' } });
      const res = createMockResponse();

      prismaMock.project.findFirst.mockResolvedValue({ id: 3 });

      await deleteProject(req, res as any);

      expect(prismaMock.project.delete).toHaveBeenCalledWith({ where: { id: 3 } });
      expect(res.json).toHaveBeenCalledWith({ message: 'Project deleted successfully' });
    });

    it('throws when project is missing', async () => {
      const req = createAuthRequest({ user, params: { id: '3' } });
      const res = createMockResponse();

      prismaMock.project.findFirst.mockResolvedValue(null);

      await expect(deleteProject(req, res as any)).rejects.toMatchObject({
        message: 'Project not found',
        statusCode: 404,
      });
    });

    it('wraps unexpected errors', async () => {
      const req = createAuthRequest({ user, params: { id: '3' } });
      const res = createMockResponse();

      prismaMock.project.findFirst.mockResolvedValue({ id: 3 });
      prismaMock.project.delete.mockRejectedValue(new Error('db error'));

      await expect(deleteProject(req, res as any)).rejects.toMatchObject({
        message: 'Failed to delete project',
        statusCode: 500,
      });
    });
  });
});
