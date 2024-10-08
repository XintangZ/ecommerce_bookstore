import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../consts';
import { BookT, CreateBookT, GetBookByIdResT, GetBooksResT } from '../types';
import { getHeaders } from '../utils';

// get all books
type FilterParamsT = {
	sortBy?: string;
	order?: 'asc' | 'desc';
	categoryId?: string;
	author?: string;
	isAvailable?: boolean;
	minPrice?: number;
	maxPrice?: number;
	search?: string;
	isLowStock?: boolean;
};

export const useGetBooks = (page: number = 1, limit: number = 10, filterParams: FilterParamsT = {}) => {
	const {
		sortBy,
		order = 'asc',
		categoryId,
		author,
		isAvailable,
		minPrice,
		maxPrice,
		search,
		isLowStock,
	} = filterParams;

	const queryParams = new URLSearchParams({
		page: page.toString(),
		limit: limit.toString(),
		order,
	});

	Object.entries({
		sortBy,
		categoryId,
		author,
		isAvailable,
		minPrice,
		maxPrice,
		search,
		isLowStock,
	}).forEach(([key, value]) => {
		if (value !== undefined) {
			queryParams.append(key, value.toString());
		}
	});

	const queryString = queryParams.toString();

	return useQuery({
		queryKey: ['books', page, limit, filterParams],
		queryFn: () =>
			axios
				.get<GetBooksResT>(`${BACKEND_URL}/books?${queryString}`)
				.then(res => res.data)
				.catch(err => console.log(err)),
		placeholderData: keepPreviousData,
	});
};

// get book by Id
export const useGetBookById = (bookId: string) => {
	return useQuery({
		queryKey: ['books', bookId],
		queryFn: () =>
			axios
				.get<GetBookByIdResT>(`${BACKEND_URL}/books/${bookId}`)
				.then(res => res.data)
				.catch(err => console.log(err)),
	});
};

// get book
export const fetchBook = async (bookId: string) => {
  const response = await axios.get<GetBookByIdResT>(`${BACKEND_URL}/books/${bookId}`);
  return response.data;
};

// create a book
export const useCreateBook = (token: string) => {
	return useMutation({
		mutationFn: async (data: CreateBookT) => {
			const res = await axios.post<BookT>(`${BACKEND_URL}/books`, data, getHeaders(token));
			return res.data;
		},
	});
};

// update a book
export const useUpdateBook = (token: string, bookId: string) => {
	return useMutation({
		mutationFn: async (data: CreateBookT) => {
			const res = await axios.put<BookT>(`${BACKEND_URL}/books/${bookId}`, data, getHeaders(token));
			return res.data;
		},
	});
};

// update book stock
export const useUpdateBookStock = (token: string, bookId: string) => {
	return useMutation({
		mutationFn: async ({ stockChange }: { stockChange: number }) => {
			const res = await axios.patch<{ data: BookT[] }>(
				`${BACKEND_URL}/books/${bookId}/stocks`,
				{ stockChange },
				getHeaders(token)
			);
			return res.data.data;
		},
	});
};

// update stock for multiple books
export const useUpdateMultipleBookStocks = (token: string) => {
	return useMutation({
		mutationFn: async ({ bookIds, stockChange }: { bookIds: string[]; stockChange: number }) => {
			const res = await axios.patch<{ data: BookT[] }>(
				`${BACKEND_URL}/books/stocks`,
				{ bookIds, stockChange },
				getHeaders(token)
			);
			return res.data.data;
		},
	});
};

// delete a book
export const useDeleteBook = (token: string, bookId: string) => {
	return useMutation({
		mutationFn: async () => {
			const res = await axios.delete<BookT>(`${BACKEND_URL}/books/${bookId}`, getHeaders(token));
			return res.data;
		},
	});
};

// delete multiple books
export const useDeleteMultipleBooks = (token: string) => {
	return useMutation({
		mutationFn: async (bookIds: string[]) => {
			const res = await axios.delete<{ message: string; deletedCount: number }>(`${BACKEND_URL}/books`, {
				data: { bookIds },
				...getHeaders(token),
			});
			return res.data;
		},
	});
};

// get book data by ISBN from open library api (external)
// export const useGetBookByIsbnExt = (isbn: string) => {
// 	return useQuery({
// 		queryKey: ['external', isbn],
// 		queryFn: () =>
// 			axios
// 				.get(`http://openlibrary.org/api/volumes/brief/isbn/${isbn}.json`)
// 				.then(res => res.data)
// 				.catch(err => console.log(err)),
// 	});
// };
