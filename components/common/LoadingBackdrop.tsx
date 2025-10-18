"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * <LoadingBackdrop />
 * ------------------
 * Drop‑in full‑screen backdrop that fades in/out while an API request is
 * pending.  Uses lucide's Loader2 icon and Tailwind utilities.
 *
 * Props:
 *  • `loading`  – boolean (required)
 *  • `className` – optional extra Tailwind classes
 */
export interface LoadingBackdropProps extends React.HTMLAttributes<HTMLDivElement> {
  loading: boolean;
}

export const LoadingBackdrop: React.FC<LoadingBackdropProps> = ({
  loading,
  className,
  ...props
}) => {
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            // Allow pointer events to pass through so UI remains interactive
            "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-none",
            className,
          )}
        >
          <Loader2 className="h-10 w-10 animate-spin text-white" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};