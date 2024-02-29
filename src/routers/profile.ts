import { Router } from 'express';

import { getAuthorProfile, updateAuthorProfile } from '@controllers/profile';
import { validateAuth } from '@middlewares/auth';

const router = Router();

router.get('/author/:authorId', validateAuth, getAuthorProfile);
router.post('/author/update-profile', validateAuth, updateAuthorProfile);

export default router;
