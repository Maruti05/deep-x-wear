"use client";
import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { getJSON, postJSON, putJSON } from "@/lib/http";
import { QUERY_KEYS } from "@/lib/query-keys";

const KEY = "/api/user-details";

export function useUserDetails() {
  const queryClient = useQueryClient();

  const { data: user, error, isLoading } = useQuery({
    queryKey: QUERY_KEYS.userDetails(),
    queryFn: () => getJSON(KEY, { emitGlobalEvents: false }),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    // We control revalidation manually in Auth flows
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const insertMutation = useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const csrfToken = Cookies.get("csrf_token");
      return postJSON(KEY, payload, {
        headers: { "X-CSRF-Token": csrfToken || "" },
      });
    },
    onSuccess: () => {
      // Refresh latest user details from server
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userDetails() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const csrfToken = Cookies.get("csrf_token");
      return putJSON(KEY, payload, {
        headers: { "X-CSRF-Token": csrfToken || "" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userDetails() });
    },
  });

  // Keep backwards-compatible helpers
  const getUser = useCallback(async () => {
    const fresh = await queryClient.fetchQuery({ queryKey: QUERY_KEYS.userDetails(), queryFn: () => getJSON(KEY, { emitGlobalEvents: false }) });
    return fresh ?? null;
  }, [queryClient]);

  const insertUser = useCallback(async (payload: Record<string, any>) => {
    const res = await insertMutation.mutateAsync(payload);
    return res;
  }, [insertMutation]);

  const updateUser = useCallback(async (payload: Record<string, any>) => {
    const res = await updateMutation.mutateAsync(payload);
    return res;
  }, [updateMutation]);

  return {
    user: user ?? null,
    isLoading,
    isError: Boolean(error),
    error: error ?? null,
    refresh: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userDetails() }),
    getUser,
    insertUser,
    updateUser,
  } as const;
}
