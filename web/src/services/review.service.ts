import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../consts';
import { GetReviewsResT, ReviewT, ReviewValidationT } from '../types';
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

// create a review
export const useCreateReview = (token: string, bookId: string) => {
	return useMutation({
		mutationFn: async (data: ReviewValidationT) => {
			const res = await axios.post<ReviewT>(`${BACKEND_URL}/books/${bookId}/reviews`, data, getHeaders(token));
			return res.data;
		},
	});
};

// update a review
export const useUpdateReview = (token: string, reviewId: string) => {
	return useMutation({
		mutationFn: async (data: ReviewValidationT) => {
			const res = await axios.put<ReviewT>(`${BACKEND_URL}/reviews/${reviewId}`, data, getHeaders(token));
			return res.data;
		},
	});
};

// delete a review
export const useDeleteReview = (token: string, reviewId: string) => {
	return useMutation({
		mutationFn: async () => {
			const res = await axios.delete<ReviewT>(`${BACKEND_URL}/reviews/${reviewId}`, getHeaders(token));
			return res.data;
		},
	});
};
