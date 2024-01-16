import { Router } from 'express';

import {
	resetPassword,
	resendVerificationToken,
	signin,
	signup,
	verifyEmail,
	verifyPasswordReset,
	updatePasswword,
} from '@controllers/auth';
import {
	CreateUserSchema,
	PasswordAndIDValidationSchema,
	TokenAndIdValidationSchema,
	SigninValidationSchema,
} from '@utils/validationSchema';
import { validate } from '@middlewares/validator';
import { validatePasswordResetToken } from '@middlewares/auth';

const router = Router();

router.post('/signup', validate(CreateUserSchema), signup);
router.post('/verify-email', validate(TokenAndIdValidationSchema), verifyEmail);
router.post('/reverify-email', resendVerificationToken);
router.post('/reset-password', resetPassword);
router.post(
	'/verify-password-reset',
	validate(TokenAndIdValidationSchema),
	validatePasswordResetToken,
	verifyPasswordReset
);
router.put(
	'/update-password',
	validate(PasswordAndIDValidationSchema),
	updatePasswword
);
router.post('/signin', validate(SigninValidationSchema), signin);

export default router;
