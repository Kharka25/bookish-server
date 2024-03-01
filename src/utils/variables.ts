const { env } = process as { env: { [key: string]: string } };

export const {
  CLOUD_KEY,
  CLOUD_NAME,
  CLOUD_SECRET,
  JWT_SECRET,
  MAILTRAP_USER,
  MAILTRAP_PASSWORD,
  MONGO_URI,
  MONGO_STAGING_URI,
  MONGO_TEST_URI,
  PASSWORD_RESET_LINK,
  PORT,
} = env;
