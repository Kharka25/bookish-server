const { env } = process as { env: { [key: string]: string } };

export const { MONGO_URI, PORT } = env;
