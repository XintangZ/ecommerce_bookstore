import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BACKEND_URL } from "../consts";
import {  GetUserResT, UpdateWishlist, UserT} from "../types";
import { getHeaders } from "../utils";

// Get user hook
export const useGetUser = (token: string) => {
    return useQuery<GetUserResT>({
      queryKey: ['user', token], // Include token to ensure uniqueness
      queryFn: async () => {
        try {
          const response = await axios.get<GetUserResT>(
            `${BACKEND_URL}/users/me`,
            getHeaders(token)
          );
          return response.data; // Ensure this matches UserT
        } catch (error) {
          console.error('Error fetching user:', error);
          throw new Error('Failed to fetch user'); // This ensures the query fails correctly
        }
      },
    });
  };

  //update user
  export const useUpdateUser = (token: string) => {
    return useMutation({
      mutationFn: async (updatedUser: UserT) => {
        const res = await axios.put<UserT>(
          `${BACKEND_URL}/users/me`,
          updatedUser,
          getHeaders(token)
        );
        return res.data;
      },
    });
  };

 //update user
 export const useUpdateWishlist = (token: string) => {
    return useMutation({
      mutationFn: async (updatedWishlist: UpdateWishlist) => {
        const res = await axios.put<UpdateWishlist>(
          `${BACKEND_URL}/users/me/wishlist`,
          updatedWishlist,
          getHeaders(token)
        );
        return res.data;
      },
    });
  };
