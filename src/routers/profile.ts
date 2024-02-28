import { Router } from 'express';

import { getAuthorProfile } from '@controllers/profile';
import { validateAuth } from '@middlewares/auth';

const router = Router();

router.get('/author/:authorId', validateAuth, getAuthorProfile);

export default router;
