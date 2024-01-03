import { Router } from 'express';

import {
	resendVerificationToken,
	signup,
	verifyEmail,
} from '@controllers/auth';
import {
	CreateUserSchema,
	TokenAndIdValidationSchema,
} from '@utils/validationSchema';
import { validate } from '@middlewares/validator';

const router = Router();

router.post('/signup', validate(CreateUserSchema), signup);
router.post('/verify-email', validate(TokenAndIdValidationSchema), verifyEmail);
router.post('/reverify-email', resendVerificationToken);

export default router;
