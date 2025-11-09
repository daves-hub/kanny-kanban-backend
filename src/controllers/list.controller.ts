import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export const getLists = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const boardId = parseInt(req.params.boardId);

    // Verify board belongs to user
    const board = await prisma.board.findFirst({
      where: {
  id: boardId,
  ownerId: req.user!.userId,
      },
    });

    if (!board) {
      throw new AppError('Board not found', 404);
    }

    const lists = await prisma.list.findMany({
      where: { boardId },
      orderBy: { position: 'asc' },
    });

    res.json(
      lists.map((list: any) => ({
        id: list.id,
        boardId: list.boardId,
        title: list.title,
        position: list.position,
        createdAt: list.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch lists', 500);
  }
};

export const createList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const boardId = parseInt(req.params.boardId);
    const { title, position } = req.body;

    // Verify board belongs to user
    const board = await prisma.board.findFirst({
      where: {
  id: boardId,
  ownerId: req.user!.userId,
      },
    });

    if (!board) {
      throw new AppError('Board not found', 404);
    }

    const list = await prisma.list.create({
      data: {
        title,
        position,
        boardId,
      },
    });

    res.status(201).json({
      id: list.id,
      boardId: list.boardId,
      title: list.title,
      position: list.position,
      createdAt: list.createdAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to create list', 500);
  }
};

export const updateList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const listId = parseInt(req.params.id);
    const { title, position } = req.body;

    // Check if list exists and belongs to user
    const existingList = await prisma.list.findFirst({
      where: { id: listId },
      include: {
        board: {
          select: {
            ownerId: true,
          },
        },
      },
    });

  if (!existingList || existingList.board.ownerId !== req.user!.userId) {
      throw new AppError('List not found', 404);
    }

    const list = await prisma.list.update({
      where: { id: listId },
      data: {
        ...(title && { title }),
        ...(position !== undefined && { position }),
      },
    });

    res.json({
      id: list.id,
      boardId: list.boardId,
      title: list.title,
      position: list.position,
      createdAt: list.createdAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to update list', 500);
  }
};

export const deleteList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const listId = parseInt(req.params.id);

    // Check if list exists and belongs to user
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

    await prisma.list.delete({
      where: { id: listId },
    });

    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to delete list', 500);
  }
};
