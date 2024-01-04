import mongoose from 'mongoose';

import { MONGO_URI, MONGO_TEST_URI } from '@utils/variables';

const URI = process.env.NODE_ENV == 'development' ? MONGO_URI : MONGO_TEST_URI;

mongoose
	.connect(URI)
	.then(() => {
		console.log('Connected to db');
	})
	.catch((err) => console.log('Error connecting to db: ', err));
