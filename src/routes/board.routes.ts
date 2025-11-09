import { Router, IRouter } from 'express';
import {
  getAllBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
} from '../controllers/board.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createBoardSchema,
  updateBoardSchema,
  boardIdSchema,
} from '../schemas';

const router: IRouter = Router();

// All board routes require authentication
router.use(authenticate);

router.get('/', getAllBoards);
router.post('/', validate(createBoardSchema), createBoard);
router.get('/:id', validate(boardIdSchema), getBoard);
router.patch('/:id', validate(updateBoardSchema), updateBoard);
router.delete('/:id', validate(boardIdSchema), deleteBoard);

export default router;
