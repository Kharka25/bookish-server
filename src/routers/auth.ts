import { Router } from 'express';

import { signup } from '@controllers/auth';
import { CreateUserSchema } from '@utils/validationSchema';
import { validate } from '@middlewares/validator';

const router = Router();

router.post('/signup', validate(CreateUserSchema), signup);

export default router;
