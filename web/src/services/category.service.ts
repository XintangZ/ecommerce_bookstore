import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../consts';
import { CategoryResT, CreateCategoryT, GetCategoriesResT } from '../types';
import { getHeaders } from '../utils';

// get all categories
export const useGetCategories = () => {
	return useQuery({
		queryKey: ['categories'],
		queryFn: () =>
			axios
				.get<GetCategoriesResT>(`${BACKEND_URL}/categories`)
				.then(res => res.data)
				.catch(err => console.log(err)),
	});
};

// get category by id
export const useGetCategoryById = (id: string) => {
	return useQuery({
		queryKey: ['categories', id],
		queryFn: () =>
			axios
				.get<CategoryResT>(`${BACKEND_URL}/categories/${id}`)
				.then(res => res.data)
				.catch(err => console.log(err)),
	});
};

// create a category
export const useCreateCategory = (token: string) => {
	return useMutation({
		mutationFn: async (data: CreateCategoryT) => {
			const res = await axios.post<CategoryResT>(`${BACKEND_URL}/categories`, data, getHeaders(token));
			return res.data;
		},
	});
};

// update a category
export const useUpdateCategory = (token: string, categoryId: string) => {
	return useMutation({
		mutationFn: async (data: CreateCategoryT) => {
			const res = await axios.put<CategoryResT>(
				`${BACKEND_URL}/categories/${categoryId}`,
				data,
				getHeaders(token)
			);
			return res.data;
		},
	});
};

// delete a category
export const useDeleteCategory = (token: string, categoryId: string) => {
	return useMutation({
		mutationFn: async () => {
			const res = await axios.delete<CategoryResT>(`${BACKEND_URL}/categories/${categoryId}`, getHeaders(token));
			return res.data;
		},
	});
};
