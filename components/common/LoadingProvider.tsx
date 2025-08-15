"use client";

import * as React from "react";
import { LoadingBackdrop } from "./LoadingBackdrop";

interface LoadingContextValue {
  /** Call this when you start an async task */
  show: () => void;
  /** Call when the task ends (success or error) */
  hide: () => void;
}

const LoadingContext = React.createContext<LoadingContextValue | null>(null);

export const LoadingProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [loading, setLoading] = React.useState(false);

 const value = React.useMemo<LoadingContextValue>(
  () => ({
    show: () => setLoading(true),
    hide: () => setLoading(false),
  }),
  [setLoading], // or just []
);


  return (
    <LoadingContext.Provider value={value}>
      {children}
      {loading&&<LoadingBackdrop loading={loading} />}
    </LoadingContext.Provider>
  );
};

export function useGlobalLoading() {
  const ctx = React.useContext(LoadingContext);
  if (!ctx) throw new Error("useGlobalLoading must be used within <LoadingProvider>");
  return ctx;
}