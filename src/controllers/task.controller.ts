import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const listId = parseInt(req.params.listId);

    // Verify list belongs to user
    const list = await prisma.list.findFirst({
      where: { id: listId },
      include: {
        board: {
          select: {
            ownerId: true,
          },
        },
      },
    });

  if (!list || list.board.ownerId !== req.user!.userId) {
      throw new AppError('List not found', 404);
    }

    const tasks = await prisma.task.findMany({
      where: { listId },
      orderBy: { position: 'asc' },
    });

    res.json(
      tasks.map((task: any) => ({
        id: task.id,
        listId: task.listId,
        title: task.title,
        description: task.description,
        position: task.position,
        createdAt: task.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch tasks', 500);
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const listId = parseInt(req.params.listId);
    const { title, description, position } = req.body;

    // Verify list belongs to user
    const list = await prisma.list.findFirst({
      where: { id: listId },
      include: {
        board: {
          select: {
            ownerId: true,
          },
        },
      },
    });

  if (!list || list.board.ownerId !== req.user!.userId) {
      throw new AppError('List not found', 404);
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        position,
        listId,
      },
    });

    res.status(201).json({
      id: task.id,
      listId: task.listId,
      title: task.title,
      description: task.description,
      position: task.position,
      createdAt: task.createdAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to create task', 500);
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const taskId = parseInt(req.params.id);
    const { title, description, listId, position } = req.body;

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId },
      include: {
        list: {
          include: {
            board: {
              select: {
                ownerId: true,
              },
            },
          },
        },
      },
    });

  if (!existingTask || existingTask.list.board.ownerId !== req.user!.userId) {
      throw new AppError('Task not found', 404);
    }

    // If moving to a different list, verify the new list belongs to user
    if (listId && listId !== existingTask.listId) {
      const newList = await prisma.list.findFirst({
        where: { id: listId },
        include: {
          board: {
            select: {
              ownerId: true,
            },
          },
        },
      });

  if (!newList || newList.board.ownerId !== req.user!.userId) {
        throw new AppError('Target list not found', 404);
      }
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(listId && { listId }),
        ...(position !== undefined && { position }),
      },
    });

    res.json({
      id: task.id,
      listId: task.listId,
      title: task.title,
      description: task.description,
      position: task.position,
      createdAt: task.createdAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to update task', 500);
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const taskId = parseInt(req.params.id);

    // Check if task exists and belongs to user
    const task = await prisma.task.findFirst({
      where: { id: taskId },
      include: {
        list: {
          include: {
            board: {
              select: {
                ownerId: true,
              },
            },
          },
        },
      },
    });

  if (!task || task.list.board.ownerId !== req.user!.userId) {
      throw new AppError('Task not found', 404);
    }

    try {
      await prisma.task.delete({
        where: { id: taskId },
      });
    } catch (err: any) {
      // If another request already deleted the task, Prisma throws P2025 (Record to delete does not exist)
      // Map that to a 404 instead of returning a 500.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new AppError('Task not found', 404);
      }
      throw err;
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to delete task', 500);
  }
};
