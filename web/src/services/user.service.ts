import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BACKEND_URL } from "../consts";
import {  UserT } from "../types";
import { getHeaders } from "../utils";

// Get user
export const useGetUser = (token: string) => {
  return useQuery<UserT>({
      queryKey: ['user',],
      queryFn: async () => {
          try {
              const res = await axios.get<UserT>(
                  `${BACKEND_URL}/users/me`,
                  getHeaders(token)
              );
              return res.data;
          } catch (err) {
              console.error(err);
              throw new Error('Failed to fetch user'); // Ensure the function never returns void
          }
      },
  });
};