"use client";

import * as React from "react";
import { LoadingBackdrop } from "./LoadingBackdrop";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";

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
  const [visible, setVisible] = React.useState(false);
  // Tracks non-React Query operations (manual, or from http.ts wrappers).
  const manualCountRef = React.useRef(0);
  const showTimerRef = React.useRef<number | null>(null);

  // React Query global network state — only count initial fetches (no cached data yet)
  const isFetchingInitial = useIsFetching({
    predicate: (q) => q.state.fetchStatus === "fetching" && !q.state.data,
  });
  const isMutating = useIsMutating();

  const updateVisibility = React.useCallback(() => {
    const combined = manualCountRef.current + isFetchingInitial + isMutating;
    if (combined > 0) {
      // If nothing is visible yet, start a short delay before showing to avoid flicker
      if (!visible && showTimerRef.current == null) {
        showTimerRef.current = window.setTimeout(() => {
          setVisible(true);
          showTimerRef.current = null;
        }, 120);
      }
    } else {
      // No active operations: cancel pending show and hide immediately
      if (showTimerRef.current != null) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
      if (visible) {
        setVisible(false);
      }
    }
  }, [isFetchingInitial, isMutating, visible]);

  const value = React.useMemo<LoadingContextValue>(
    () => ({
      show: () => {
        manualCountRef.current += 1;
        updateVisibility();
      },
      hide: () => {
        manualCountRef.current = Math.max(0, manualCountRef.current - 1);
        updateVisibility();
      },
    }),
    [updateVisibility]
  );

  // React Query state changes should drive visibility automatically
  React.useEffect(() => {
    updateVisibility();
  }, [isFetchingInitial, isMutating, updateVisibility]);

  // Listen to global window events emitted by http.ts
  React.useEffect(() => {
    const onStart = () => {
      manualCountRef.current += 1;
      updateVisibility();
    };
    const onEnd = () => {
      manualCountRef.current = Math.max(0, manualCountRef.current - 1);
      updateVisibility();
    };

    window.addEventListener("global-loading-start", onStart as EventListener);
    window.addEventListener("global-loading-end", onEnd as EventListener);

    return () => {
      window.removeEventListener("global-loading-start", onStart as EventListener);
      window.removeEventListener("global-loading-end", onEnd as EventListener);
    };
  }, [updateVisibility]);

  React.useEffect(() => {
    return () => {
      if (showTimerRef.current != null) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
      // Reset manual counter on unmount
      manualCountRef.current = 0;
      setVisible(false);
    };
  }, []);

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {visible && <LoadingBackdrop loading={visible} />}
    </LoadingContext.Provider>
  );
};

export function useGlobalLoading() {
  const ctx = React.useContext(LoadingContext);
  if (!ctx) throw new Error("useGlobalLoading must be used within <LoadingProvider>");
  return ctx;
}