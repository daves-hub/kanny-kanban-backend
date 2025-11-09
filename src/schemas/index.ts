import { z } from 'zod';

// Auth schemas
export const signupSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().optional(),
  }),
});

export const signinSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// Project schemas
export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().optional(),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid project ID'),
  }),
  body: z.object({
    name: z.string().min(1, 'Project name is required').optional(),
    description: z.string().optional().nullable(),
  }),
});

export const projectIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid project ID'),
  }),
});

// Board schemas
export const createBoardSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Board name is required'),
    projectId: z.number().int().positive().optional().nullable(),
  }),
});

export const updateBoardSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid board ID'),
  }),
  body: z.object({
    name: z.string().min(1, 'Board name is required').optional(),
    projectId: z.number().int().positive().optional().nullable(),
  }),
});

export const boardIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid board ID'),
  }),
});

// List schemas
export const createListSchema = z.object({
  params: z.object({
    boardId: z.string().regex(/^\d+$/, 'Invalid board ID'),
  }),
  body: z.object({
    title: z.string().min(1, 'List title is required'),
    position: z.number().int().nonnegative(),
  }),
});

export const updateListSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid list ID'),
  }),
  body: z.object({
    title: z.string().min(1, 'List title is required').optional(),
    position: z.number().int().nonnegative().optional(),
  }),
});

export const listIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid list ID'),
  }),
});

// Task schemas
export const createTaskSchema = z.object({
  params: z.object({
    listId: z.string().regex(/^\d+$/, 'Invalid list ID'),
  }),
  body: z.object({
    title: z.string().min(1, 'Task title is required'),
    description: z.string().optional().nullable(),
    position: z.number().int().nonnegative(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid task ID'),
  }),
  body: z.object({
    title: z.string().min(1, 'Task title is required').optional(),
    description: z.string().optional().nullable(),
    listId: z.number().int().positive().optional(),
    position: z.number().int().nonnegative().optional(),
  }),
});

export const taskIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid task ID'),
  }),
});
