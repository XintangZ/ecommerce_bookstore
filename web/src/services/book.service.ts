import { keepPreviousData, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../consts';
import { GetBookByIdResT, GetBooksResT } from '../types';

// get all books
export const useGetBooks = (page: number = 1, limit: number = 10) => {
	return useQuery({
		queryKey: ['books', page],
		queryFn: () =>
			axios
				.get<GetBooksResT>(`${BACKEND_URL}/books?page=${page}&limit=${limit}`)
				.then(res => res.data)
				.catch(err => console.log(err)),
		placeholderData: keepPreviousData,
	});
};

// get book by Id
export const useGetBookById = (id: string) => {
	return useQuery({
		queryKey: ['books', id],
		queryFn: () =>
			axios
				.get<GetBookByIdResT>(`${BACKEND_URL}/books/${id}`)
				.then(res => res.data)
				.catch(err => console.log(err)),
	});
};
