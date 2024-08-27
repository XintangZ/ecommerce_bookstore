import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../consts';
import { LoginReqT, LoginResT, RegisterReqT } from '../types';

// login
export const useLogin = () => {
	return useMutation({
		mutationFn: (data: LoginReqT) => axios.post<LoginResT>(`${BACKEND_URL}/users/login`, data),
	});
};

// register
export const useRegister = () => {
	return useMutation({
		mutationFn: (data: RegisterReqT) => axios.post<LoginResT>(`${BACKEND_URL}/users`, data),
	});
};
