"use client";
import useSWRMutation from "swr/mutation";
import Cookies from "js-cookie";

type UserDetails = {
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
  const { trigger, data, error, isMutating, reset } = useSWRMutation(
    KEY,
    async (url: string, { arg }: { arg: UserDetails }) => {
      const csrfToken = Cookies.get("csrf_token");
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-Token": csrfToken || "",
        },
        body: JSON.stringify(arg),
        cache: "no-store",
        credentials: "same-origin",
        redirect: "error",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw Object.assign(new Error(errData.error || "Failed to create user"), {
          status: res.status,
          details: errData,
        });
      }

      return res.json();
    }
  );

  // Backwards-compatible mutate signature
  const mutate = async ({ userDetails }: { userDetails: UserDetails }) => {
    return trigger(userDetails);
  };

  return {
    mutate,
    data: data ?? null,
    error: error ?? null,
    isLoading: isMutating,
    isError: Boolean(error),
    isSuccess: Boolean(data && !error),
    reset,
    status: isMutating ? "loading" : data ? "success" : error ? "error" : "idle",
  } as const;
}