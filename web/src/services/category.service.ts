import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../consts';
import { CategoryResT, GetCategoriesResT } from '../types';
import { getHeaders } from '../utils';

// get all categories
export const useGetCategories = () => {
	return useQuery({
		queryKey: ['categories'],
		queryFn: () => axios.get<GetCategoriesResT>(`${BACKEND_URL}/categories`),
	});
};

// get category by id
export const useGetCategoryById = (id: string) => {
	return useQuery({
		queryKey: ['categories', id],
		queryFn: () => axios.get<CategoryResT>(`${BACKEND_URL}/categories/${id}`),
	});
};

// create a category
export const useCreateCategory = (token: string) => {
	return useMutation({
		mutationFn: data => axios.post<CategoryResT>(`${BACKEND_URL}/categories`, data, getHeaders(token)),
	});
};

// update a category
export const useUpdateCategory = (token: string) => {
	return useMutation({
		mutationFn: data => axios.put<CategoryResT>(`${BACKEND_URL}/categories`, data, getHeaders(token)),
	});
};

// delete a category
export const useDeleteCategory = (id: string, token: string) => {
	return useMutation({
		mutationFn: () => axios.delete<CategoryResT>(`${BACKEND_URL}/categories/${id}`, getHeaders(token)),
	});
};
