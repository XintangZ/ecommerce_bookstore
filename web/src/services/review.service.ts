import { keepPreviousData, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../consts';
import { GetReviewsResT } from '../types';
import { getHeaders } from '../utils';

// get all reviews of a book
export const useGetReviewsByBook = (bookId: string, page: number = 1, limit: number = 10) => {
	return useQuery({
		queryKey: ['reviews', page, bookId],
		queryFn: () =>
			axios
				.get<GetReviewsResT>(`${BACKEND_URL}/books/${bookId}/reviews?page=${page}&limit=${limit}`)
				.then(res => res.data)
				.catch(err => console.log(err)),
		placeholderData: keepPreviousData,
	});
};

// get all reviews of a user
export const useGetReviewsByUser = (token: string, page: number = 1, limit: number = 10) => {
	return useQuery({
		queryKey: ['reviews', page, 'me'],
		queryFn: () =>
			axios
				.get<GetReviewsResT>(`${BACKEND_URL}/reviews/me?page=${page}&limit=${limit}`, getHeaders(token))
				.then(res => res.data)
				.catch(err => console.log(err)),
		placeholderData: keepPreviousData,
	});
};
