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
  const [visible, setVisible] = React.useState(false);
  const countRef = React.useRef(0);
  const showTimerRef = React.useRef<number | null>(null);

  const value = React.useMemo<LoadingContextValue>(
    () => ({
      show: () => {
        // Increment active operations counter
        countRef.current += 1;
        // If this is the first operation, start a short delay before showing to avoid flicker
        if (countRef.current === 1 && showTimerRef.current == null) {
          showTimerRef.current = window.setTimeout(() => {
            setVisible(true);
            showTimerRef.current = null;
          }, 120);
        }
      },
      hide: () => {
        // Decrement and clamp to zero
        countRef.current = Math.max(0, countRef.current - 1);
        // Only hide when no active operations remain
        if (countRef.current === 0) {
          // Cancel pending show timer if any
          if (showTimerRef.current != null) {
            clearTimeout(showTimerRef.current);
            showTimerRef.current = null;
          }
          setVisible(false);
        }
      },
    }),
    []
  );

  React.useEffect(() => {
    return () => {
      if (showTimerRef.current != null) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
      // Reset counter on unmount
      countRef.current = 0;
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