import { Router, IRouter } from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
} from '../schemas';

const router: IRouter = Router();

// All task routes require authentication
router.use(authenticate);

// Tasks are nested under lists
router.get('/lists/:listId/tasks', getTasks);
router.post('/lists/:listId/tasks', validate(createTaskSchema), createTask);
router.patch('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', validate(taskIdSchema), deleteTask);

export default router;
