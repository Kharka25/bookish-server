const { env } = process as { env: { [key: string]: string } };

export const {
	JWT_SECRET,
	MAILTRAP_USER,
	MAILTRAP_PASSWORD,
	MONGO_URI,
	MONGO_TEST_URI,
	PASSWORD_RESET_LINK,
	PORT,
} = env;
