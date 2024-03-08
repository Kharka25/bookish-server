import mongoose from 'mongoose';

global.afterAll(async () => {
  await mongoose.disconnect();
});
