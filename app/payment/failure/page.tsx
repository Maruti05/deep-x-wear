"use client";

import { useSearchParams } from "next/navigation";
import { XCircle, RefreshCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function PaymentFailurePage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const errorMessage = searchParams.get("error") || "Your payment could not be processed";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">Payment Failed</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-red-50 p-4 border border-red-100">
            <p className="text-center text-gray-700">
              {errorMessage}
            </p>
          </div>
          
          {orderId && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Order Reference:</p>
              <p className="font-medium bg-gray-100 p-2 rounded">{orderId}</p>
            </div>
          )}
          
          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-gray-500 mb-2">What you can do next:</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-gray-100 p-1 mt-0.5">
                  <RefreshCcw className="h-3 w-3 text-gray-600" />
                </div>
                <span>Try the payment again with a different payment method</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-gray-100 p-1 mt-0.5">
                  <RefreshCcw className="h-3 w-3 text-gray-600" />
                </div>
                <span>Check if your card has sufficient balance</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-gray-100 p-1 mt-0.5">
                  <RefreshCcw className="h-3 w-3 text-gray-600" />
                </div>
                <span>Contact customer support if the problem persists</span>
              </li>
            </ul>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-2">
          <Link href={`/cart`} className="w-full">
            <Button className="w-full flex items-center gap-2">
              <RefreshCcw className="h-4 w-4" />
              Try Again
            </Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Return to Shopping
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}