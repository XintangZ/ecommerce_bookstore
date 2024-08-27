import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../consts';
import { AuthResT, LoginReqT, RegisterReqT } from '../types';

// login
export const useLogin = () => {
	return useMutation({
		mutationFn: (data: LoginReqT) => axios.post<AuthResT>(`${BACKEND_URL}/users/login`, data),
	});
};

// register
export const useRegister = () => {
	return useMutation({
		mutationFn: (data: RegisterReqT) => axios.post<AuthResT>(`${BACKEND_URL}/users`, data),
	});
};
