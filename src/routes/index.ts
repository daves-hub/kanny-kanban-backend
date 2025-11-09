import { Router, IRouter } from 'express';
import authRoutes from './auth.routes';
import projectRoutes from './project.routes';
import boardRoutes from './board.routes';
import listRoutes from './list.routes';
import taskRoutes from './task.routes';

const router: IRouter = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/boards', boardRoutes);
router.use('/lists', listRoutes);
router.use('/tasks', taskRoutes);

export default router;
