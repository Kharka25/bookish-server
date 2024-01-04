import { ObjectId, model, Model, Schema } from 'mongoose';
import { compare, hash } from 'bcrypt';

interface EmailVerificationTokenI {
	createdAt: Date;
	owner: ObjectId;
	token: string;
}

interface Methods {
	compareToken: (token: string) => Promise<boolean>;
}

const emailVerificationTokenSchema = new Schema<
	EmailVerificationTokenI,
	{},
	Methods
>(
	{
		createdAt: {
			default: Date.now(),
			expires: 3600,
			required: true,
			type: Date,
		},
		owner: {
			ref: 'User',
			required: true,
			type: Schema.Types.ObjectId,
		},
		token: {
			required: true,
			type: String,
		},
	},
	{ timestamps: true }
);

emailVerificationTokenSchema.pre('save', async function (next) {
	if (this.isModified('token')) this.token = await hash(this.token, 10);
	next();
});

emailVerificationTokenSchema.methods.compareToken = async function (token) {
	return await compare(token, this.token);
};

export default model(
	'EmailVerificationToken',
	emailVerificationTokenSchema
) as Model<EmailVerificationTokenI, {}, Methods>;
