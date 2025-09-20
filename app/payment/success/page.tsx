"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch order details if needed
    if (orderId) {
      setLoading(false);
      // You can fetch order details here if needed
    } else {
      setLoading(false);
    }
  }, [orderId]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-green-50 p-4 border border-green-100">
            <p className="text-center text-gray-700">
              Your payment has been processed successfully. Thank you for your purchase!
            </p>
          </div>
          
          {orderId && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Order Reference:</p>
              <p className="font-medium bg-gray-100 p-2 rounded">{orderId}</p>
            </div>
          )}
          
          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-gray-500 mb-2">What happens next?</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-green-100 p-1 mt-0.5">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
                <span>A confirmation email has been sent to your email address</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-green-100 p-1 mt-0.5">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
                <span>Your order is being processed and will be shipped soon</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-green-100 p-1 mt-0.5">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
                <span>You can track your order in the order history section</span>
              </li>
            </ul>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-2">
          <Link href="/order-history" className="w-full">
            <Button className="w-full flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              View Order History
            </Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full flex items-center gap-2">
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}