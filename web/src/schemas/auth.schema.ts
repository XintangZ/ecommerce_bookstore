import { z } from 'zod';
import { createUserSchema } from '../../../server/src/schema';

export const LoginReqSchema = z.object({
	email: z.string().min(1, 'Please enter your email').email('Please enter a valid e-mail address'),
	password: z.string().min(1, 'Please enter your password'),
});

export const RegisterReqSchemaExt = createUserSchema
	.extend({
		confirmPassword: z.string(),
	})
	.refine(data => data.password === data.confirmPassword, {
		message: 'Password does not match',
		path: ['confirmPassword'],
	});
