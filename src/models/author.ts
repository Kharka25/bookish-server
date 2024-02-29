import { ObjectId, model, Model, Schema } from 'mongoose';

import { AuthorCategories, AuthorCategoryT } from '@types';

export interface AuthorI<T = ObjectId> {
  authorId: T;
  bio: string;
  category: AuthorCategoryT;
  products: ObjectId[];
  rating: number;
}

const authorSchema = new Schema<AuthorI>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      default: 'Others',
      enum: AuthorCategories,
    },
    products: [{ type: Schema.Types.ObjectId, ref: 'Book' }],
    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default model('Author', authorSchema) as Model<AuthorI>;
