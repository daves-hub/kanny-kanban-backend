import { Router, IRouter } from 'express';
import {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/project.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdSchema,
} from '../schemas';

const router: IRouter = Router();

// All project routes require authentication
router.use(authenticate);

router.get('/', getAllProjects);
router.post('/', validate(createProjectSchema), createProject);
router.get('/:id', validate(projectIdSchema), getProject);
router.patch('/:id', validate(updateProjectSchema), updateProject);
router.delete('/:id', validate(projectIdSchema), deleteProject);

export default router;
