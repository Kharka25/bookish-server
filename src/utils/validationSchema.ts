import * as yup from 'yup';
import { isValidObjectId } from 'mongoose';

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
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
      'Password must contain at least 1 uppercase, 1 lowercase, a number and a special character'
    ),
  userType: yup
    .string()
    .oneOf(['user', 'author'], 'userType must be user or author')
    .required('userType is required!'),
});

export const TokenAndIdValidationSchema = yup.object().shape({
  token: yup.string().trim().required('Invalid Token'),
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) return value;

      return '';
    })
    .required('Invalid userId'),
});

export const PasswordAndIDValidationSchema = yup.object().shape({
  password: yup.string().trim().required('Invalid Password'),
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) return value;

      return '';
    })
    .required('Invalid userId'),
});

export const SigninValidationSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .required('Email is required')
    .email('Invalid email!'),
  password: yup.string().trim().required('Password is required'),
});
