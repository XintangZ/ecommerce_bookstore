import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../consts';
import { getHeaders } from '../utils';
import { CartUpdateActionT } from '../types';

// update cart
export const useUpdateCart = (token: string ) => {
  return useMutation({
    mutationFn: async (data: CartUpdateActionT) => {
      const res = await axios.put<CartUpdateActionT>(
        `${BACKEND_URL}/cart`,
        data,
        getHeaders(token)
      );
      return res.data;
    },
  });
};


// get cart
export const fetchCart = async (token: string) => {
  const response = await axios.get(`${BACKEND_URL}/cart`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};