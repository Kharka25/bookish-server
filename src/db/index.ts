import mongoose from 'mongoose';

import { MONGO_URI } from '@utils/variables';

mongoose
	.connect(MONGO_URI)
	.then(() => {
		console.log('Connected to db');
	})
	.catch((err) => console.log('Error connecting to db: ', err));
