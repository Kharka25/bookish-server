import { Request } from 'express';

declare global {
	namespace Express {
		interface Request {
			user: {
				id: any;
				avatar?: string;
				email: string;
				firstName: string;
				lastName: string;
				followers: number;
				followings: number;
				verified: boolean;
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

export { SignUpRequest, SignInRequest };
