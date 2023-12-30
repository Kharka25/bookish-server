import * as yup from 'yup';

export const CreateUserSchema = yup.object().shape({
	name: yup
		.string()
		.trim()
		.required('Name is required!')
		.min(3, 'Name is too short!')
		.max(20, 'Name is too long!'),
	email: yup.string().email('Invalid email!').required('Email is required!'),
	password: yup
		.string()
		.required('Password is required!')
		.trim()
		.min(8, 'Password is too short!')
		.matches(
			/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/,
			'Password is weak!'
		),
});
