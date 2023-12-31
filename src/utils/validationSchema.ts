import * as yup from 'yup';

export const CreateUserSchema = yup.object().shape({
	username: yup
		.string()
		.trim()
		.required('Name is required!')
		.min(3, 'Name should have a min of 3 and max of 20 characters')
		.max(20, 'Name should have a min of 3 and max of 20 characters'),
	email: yup.string().email('Invalid email!').required('Email is required!'),
	password: yup
		.string()
		.required('Password is required!')
		.trim()
		.min(8, 'Password must have at least 8 characters')
		.matches(
			/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/,
			'Password must contain at least 1 uppercase, 1 lowercase, a number and a special character'
		),
});
