import { Router } from 'express';

import {
	resetPassword,
	resendVerificationToken,
	signIn,
	signUp,
	verifyEmail,
	verifyPasswordReset,
	updatePasswword,
	updateProfile,
} from '@controllers/auth';
import {
	CreateUserSchema,
	PasswordAndIDValidationSchema,
	TokenAndIdValidationSchema,
	SigninValidationSchema,
	UserUpdateValidationSchema,
} from '@utils/validationSchema';
import { validate } from '@middlewares/validator';
import { validateAuth, validatePasswordResetToken } from '@middlewares/auth';

const router = Router();

router.post('/signup', validate(CreateUserSchema), signUp);
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
router.post('/signin', validate(SigninValidationSchema), signIn);
router.put(
	'/update-profile',
	validateAuth,
	validate(UserUpdateValidationSchema),
	updateProfile
);

export default router;
