// hooks/useUserDetails.ts
import { useCallback } from "react";
import useSWR from "swr";
import Cookies from "js-cookie";

// Centralized fetcher with robust error handling and safe JSON parsing
const fetcher = async (url: string) => {
  const res = await fetch(url, {
    method: "GET",
    headers: { "Accept": "application/json" },
    // Prevent any intermediate caching and ensure cookies are sent
    cache: "no-store",
    credentials: "same-origin",
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const error = new Error(errData.error || `Request failed: ${res.status}`);
    (error as any).status = res.status;
    (error as any).details = errData;
    throw error;
  }
  return res.json();
};

const KEY = "/api/user-details";

export function useUserDetails() {
  // Keep a stable SWR key so mutations and revalidation work reliably
  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR(KEY, fetcher, {
    revalidateOnFocus: false, // avoid flicker when switching tabs
    revalidateOnMount: false, // opt-in manual fetch on demand
    revalidateOnReconnect: true,
    dedupingInterval: 1000, // reduce redundant requests
    shouldRetryOnError: false,
    fallbackData: null,
  });

  // Manually revalidate and return the latest data (no extra fetch duplication)
  const getUser = useCallback(async () => {
    const data = await mutate(); // revalidate using bound fetcher
    return data ?? null;
  }, [mutate]);

  // Insert new user via secure Next.js route handler, then refresh SWR cache
  const insertUser = useCallback(async (payload: Record<string, any>) => {
    const csrfToken = Cookies.get("csrf_token");
    const res = await fetch(KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json", "X-CSRF-Token": csrfToken || "" },
      body: JSON.stringify(payload),
      cache: "no-store",
      credentials: "same-origin",
      redirect: "error",
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw Object.assign(new Error(errData.error || "Insert failed"), {
        status: res.status,
        details: errData,
      });
    }
    const data = await res.json();
    await mutate(); // refresh from server to ensure consistency
    return data;
  }, [mutate]);

  // Update user via secure Next.js route handler, then refresh SWR cache
  const updateUser = useCallback(async (payload: Record<string, any>) => {
    const csrfToken = Cookies.get("csrf_token");
    const res = await fetch(KEY, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Accept": "application/json", "X-CSRF-Token": csrfToken || "" },
      body: JSON.stringify(payload),
      cache: "no-store",
      credentials: "same-origin",
      redirect: "error",
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw Object.assign(new Error(errData.error || "Update failed"), {
        status: res.status,
        details: errData,
      });
    }
    const data = await res.json();
    await mutate(); // refresh from server
    return data;
  }, [mutate]);

  return {
    user: user ?? null,
    isLoading,
    isError: Boolean(error),
    error: error ?? null,
    refresh: mutate,
    getUser, // manual fetch/revalidate
    insertUser,
    updateUser,
  } as const;
}
