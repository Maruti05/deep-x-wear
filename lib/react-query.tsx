"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Keep data fresh for a minute and garbage collect after 5 minutes
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: 2,
      },
      mutations: {
        retry: 0,
      },
    },
  });

let client: QueryClient | undefined;

function getQueryClient() {
  if (!client) client = makeQueryClient();
  return client;
}

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV !== "production" ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
    </QueryClientProvider>
  );
}