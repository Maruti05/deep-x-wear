"use client";
import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { postJSON } from "@/lib/http";

export type UserDetails = {
  full_name: string;
  email: string;
  phone_number?: string;
  user_id: string;
  user_address?: string;
  city?: string;
  state_name?: string;
  pin_code?: number;
  country?: string;
  role: "USER" | "ADMIN";
};

const KEY = "/api/user-details";

export function useCreateUser() {
  const mutation = useMutation({
    mutationFn: async (userDetails: UserDetails) => {
      const csrfToken = Cookies.get("csrf_token");
      return postJSON(KEY, userDetails, {
        headers: {
          "X-CSRF-Token": csrfToken || "",
        },
      });
    },
  });

  // Backwards-compatible mutate signature
  const mutate = async ({ userDetails }: { userDetails: UserDetails }) => {
    return mutation.mutateAsync(userDetails);
  };

  const reset = () => mutation.reset();

  return {
    mutate,
    data: mutation.data ?? null,
    error: mutation.error ?? null,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    reset,
    status: mutation.status,
  } as const;
}