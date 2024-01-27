import { Request } from 'express';

declare global {
	namespace Express {
		interface Request {
			user: {
				id: any;
				activationToken?: string;
				avatar?: string;
				email: string;
				favorites?: string[];
				verified: boolean;
				username: string;
			};
			token: string;
		}
	}
}

interface SignUpRequest extends Request {
	body: {
		email: string;
		password: string;
		username: string;
	};
}

interface SignInRequest extends Request {
	body: {
		email: string;
		password: string;
	};
}

interface VerifyEmailRequest extends Request {
	body: {
		token: string;
		userId: string;
	};
}

export { SignUpRequest, SignInRequest, VerifyEmailRequest };
