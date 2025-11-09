import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export const getAllProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const projects = await prisma.project.findMany({
  where: { ownerId: req.user!.userId },
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

    res.json(
      projects.map((project: any) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        ownerId: project.ownerId,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        boards: project.boards,
      }))
    );
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch projects', 500);
  }
};

export const getProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const projectId = parseInt(req.params.id);

    const project = await prisma.project.findFirst({
      where: {
  id: projectId,
  ownerId: req.user!.userId,
      },
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

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    res.json({
      id: project.id,
      name: project.name,
      description: project.description,
      ownerId: project.ownerId,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      boards: project.boards.map((board: any) => ({
        ...board,
        createdAt: board.createdAt.toISOString(),
        updatedAt: board.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch project', 500);
  }
};

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { name, description } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
  ownerId: req.user!.userId,
      },
    });

    res.status(201).json({
      id: project.id,
      name: project.name,
      description: project.description,
      ownerId: project.ownerId,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to create project', 500);
  }
};

export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const projectId = parseInt(req.params.id);
    const { name, description } = req.body;

    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
  ownerId: req.user!.userId,
      },
    });

    if (!existingProject) {
      throw new AppError('Project not found', 404);
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
    });

    res.json({
      id: project.id,
      name: project.name,
      description: project.description,
      ownerId: project.ownerId,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to update project', 500);
  }
};

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const projectId = parseInt(req.params.id);

    // Check if project exists and belongs to user
    const project = await prisma.project.findFirst({
      where: {
  id: projectId,
  ownerId: req.user!.userId,
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to delete project', 500);
  }
};
