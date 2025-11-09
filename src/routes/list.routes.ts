import { Router, IRouter } from 'express';
import {
  getLists,
  createList,
  updateList,
  deleteList,
} from '../controllers/list.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createListSchema,
  updateListSchema,
  listIdSchema,
} from '../schemas';

const router: IRouter = Router();

// All list routes require authentication
router.use(authenticate);

// Lists are nested under boards
router.get('/boards/:boardId/lists', validate(createListSchema), getLists);
router.post('/boards/:boardId/lists', validate(createListSchema), createList);
router.patch('/:id', validate(updateListSchema), updateList);
router.delete('/:id', validate(listIdSchema), deleteList);

export default router;
