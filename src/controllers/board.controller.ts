import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export const getAllBoards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { projectId } = req.query;

    const boards = await prisma.board.findMany({
      where: {
  ownerId: req.user!.userId,
        ...(projectId && { projectId: parseInt(projectId as string) }),
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(
      boards.map((board: any) => ({
        id: board.id,
        name: board.name,
        ownerId: board.ownerId,
        projectId: board.projectId,
        createdAt: board.createdAt.toISOString(),
        updatedAt: board.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch boards', 500);
  }
};

export const getBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const boardId = parseInt(req.params.id);

    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
  ownerId: req.user!.userId,
      },
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

    if (!board) {
      throw new AppError('Board not found', 404);
    }

    res.json({
      id: board.id,
      name: board.name,
      ownerId: board.ownerId,
      projectId: board.projectId,
      createdAt: board.createdAt.toISOString(),
      updatedAt: board.updatedAt.toISOString(),
      lists: board.lists.map((list: any) => ({
        id: list.id,
        boardId: list.boardId,
        title: list.title,
        position: list.position,
        createdAt: list.createdAt.toISOString(),
        tasks: list.tasks.map((task: any) => ({
          id: task.id,
          listId: task.listId,
          title: task.title,
          description: task.description,
          position: task.position,
          createdAt: task.createdAt.toISOString(),
        })),
      })),
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch board', 500);
  }
};

export const createBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { name, projectId } = req.body;

    // If projectId is provided, verify it belongs to the user
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          ownerId: req.user!.userId,
        },
      });

      if (!project) {
        throw new AppError('Project not found', 404);
      }
    }

    const defaultLists = [
      { title: 'Todo', position: 0 },
      { title: 'In Progress', position: 1 },
      { title: 'Complete', position: 2 },
    ];

    const board = await prisma.$transaction(async (tx) => {
      const createdBoard = await tx.board.create({
        data: {
          name,
          projectId: projectId || null,
          ownerId: req.user!.userId,
        },
      });

      await tx.list.createMany({
        data: defaultLists.map((list) => ({
          title: list.title,
          position: list.position,
          boardId: createdBoard.id,
        })),
      });

      return createdBoard;
    });

    const lists = await prisma.list.findMany({
      where: { boardId: board.id },
      orderBy: { position: 'asc' },
    });

    res.status(201).json({
      id: board.id,
      name: board.name,
      ownerId: board.ownerId,
      projectId: board.projectId,
      createdAt: board.createdAt.toISOString(),
      updatedAt: board.updatedAt.toISOString(),
      lists: lists.map((list: any) => ({
        id: list.id,
        boardId: list.boardId,
        title: list.title,
        position: list.position,
        createdAt: list.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to create board', 500);
  }
};

export const updateBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const boardId = parseInt(req.params.id);
    const { name, projectId } = req.body;

    // Check if board exists and belongs to user
    const existingBoard = await prisma.board.findFirst({
      where: {
  id: boardId,
  ownerId: req.user!.userId,
      },
    });

    if (!existingBoard) {
      throw new AppError('Board not found', 404);
    }

    // If projectId is provided, verify it belongs to the user
    if (projectId !== undefined && projectId !== null) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          ownerId: req.user!.userId,
        },
      });

      if (!project) {
        throw new AppError('Project not found', 404);
      }
    }

    const board = await prisma.board.update({
      where: { id: boardId },
      data: {
        ...(name && { name }),
        ...(projectId !== undefined && { projectId }),
      },
    });

    res.json({
      id: board.id,
      name: board.name,
      ownerId: board.ownerId,
      projectId: board.projectId,
      createdAt: board.createdAt.toISOString(),
      updatedAt: board.updatedAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to update board', 500);
  }
};

export const deleteBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const boardId = parseInt(req.params.id);

    // Check if board exists and belongs to user
    const board = await prisma.board.findFirst({
      where: {
  id: boardId,
  ownerId: req.user!.userId,
      },
    });

    if (!board) {
      throw new AppError('Board not found', 404);
    }

    await prisma.board.delete({
      where: { id: boardId },
    });

    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to delete board', 500);
  }
};
