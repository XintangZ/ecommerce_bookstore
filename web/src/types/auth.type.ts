import { z } from 'zod';
import { createUserSchema } from '../../../server/src/schema';
import { LoginReqSchema, RegisterReqSchemaExt } from '../schemas';
import { UserT } from './user.type';

export type LoginReqT = z.infer<typeof LoginReqSchema>;

export type RegisterReqT = z.infer<typeof createUserSchema>;

export type RegisterReqExt = z.infer<typeof RegisterReqSchemaExt>;

export type AuthResT = {
	token: string;
	user: UserT;
};
