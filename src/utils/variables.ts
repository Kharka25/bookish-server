const { env } = process as { env: { [key: string]: string } };

export const { MAILTRAP_USER, MAILTRAP_PASSWORD, MONGO_URI, PORT } = env;
