"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {BrandLogo} from "@/components/common/BrandLogo";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Minimal client-side logging for global errors.
    // Integrate with your error tracking provider if configured.
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen w-full flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-2xl space-y-6 text-center">
            <div className="flex justify-center">
              <BrandLogo />
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">We hit a snag</h1>
            <p className="text-muted-foreground">The site encountered an unexpected error. You can try reloading or navigate back to a safe page.</p>

            <Alert>
              <AlertTitle>Technical details</AlertTitle>
              <AlertDescription>
                <details className="mt-2 text-left">
                  <summary className="cursor-pointer select-none">Show error message</summary>
                  <pre className="mt-2 whitespace-pre-wrap break-words text-sm">
                    {error?.message || "Unknown error"}
                  </pre>
                </details>
              </AlertDescription>
            </Alert>

            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <Button onClick={() => reset()} variant="default">Reload</Button>
              <Link href="/" className="inline-flex">
                <Button variant="secondary">Go to Home</Button>
              </Link>
              <Link href="/contact-us" className="inline-flex">
                <Button variant="outline">Contact Support</Button>
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}