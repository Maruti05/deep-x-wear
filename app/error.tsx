"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {BrandLogo} from "@/components/common/BrandLogo";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    // Basic client-side logging; integrate with your error tracking if available
    // Avoid logging sensitive information in production
    console.error("Segment error boundary caught:", error);
  }, [error]);

  const goHome = () => router.push("/");
  const goSupport = () => router.push("/contact-us");

  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-2xl space-y-6 text-center">
        <div className="flex justify-center">
          <BrandLogo />
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="text-muted-foreground">An unexpected error occurred. You can try again or return to the homepage.</p>

        <Alert>
          <AlertTitle>Error details</AlertTitle>
          <AlertDescription>
            <details className="mt-2 text-left">
              <summary className="cursor-pointer select-none">Show technical details</summary>
              <pre className="mt-2 whitespace-pre-wrap break-words text-sm">
                {error?.message || "Unknown error"}
              </pre>
            </details>
          </AlertDescription>
        </Alert>

        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Button onClick={() => reset()} variant="default">Try again</Button>
          <Button onClick={goHome} variant="secondary">Go to Home</Button>
          <Button onClick={goSupport} variant="outline">Contact Support</Button>
        </div>
      </div>
    </div>
  );
}