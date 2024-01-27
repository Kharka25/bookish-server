import { ObjectId, model, Model, Schema } from 'mongoose';
import { compare, hash } from 'bcrypt';

export interface UserI {
	_id: ObjectId;
	activationToken: string;
	username: string;
	email: string;
	password: string;
	verified: boolean;
	avatar?: { url: string; publicId: string };
	tokens: string[];
	favorites: ObjectId[];
}

interface Methods {
	comparePassword: (password: string) => Promise<boolean>;
}

const userSchema = new Schema<UserI, {}, Methods>({
	activationToken: {
		type: String,
		trim: true,
	},
	username: {
		type: String,
		required: true,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	verified: {
		type: Boolean,
		default: false,
	},
	avatar: {
		type: Object,
		url: String,
		publicId: String,
	},
	favorites: [{ type: Schema.Types.ObjectId, ref: 'Book' }],
	tokens: [String],
});

userSchema.pre('save', async function (next) {
	if (this.isModified('password'))
		this.password = await hash(this.password, 10);
	next();
});

userSchema.methods.comparePassword = async function (password) {
	return await compare(password, this.password);
};

export default model('User', userSchema) as Model<UserI, {}, Methods>;
