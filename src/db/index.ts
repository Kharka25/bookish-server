import mongoose from 'mongoose';

import { MONGO_URI, MONGO_STAGING_URI, MONGO_TEST_URI } from '@utils/variables';

const URI =
  process.env.NODE_ENV == 'development'
    ? MONGO_URI
    : process.env.NODE_ENV == 'staging'
      ? MONGO_STAGING_URI
      : MONGO_TEST_URI;

mongoose
  .connect(URI)
  .then(() => {
    console.log('Connected to db');
    console.log(process.env.NODE_ENV);
  })
  .catch((err) => console.log('Error connecting to db: ', err));
