import { Router, IRouter } from 'express';
import { signup, signin, signout, me } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { signupSchema, signinSchema } from '../schemas';

const router: IRouter = Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/signin', validate(signinSchema), signin);
router.post('/signout', signout);
router.get('/me', authenticate, me);

export default router;
