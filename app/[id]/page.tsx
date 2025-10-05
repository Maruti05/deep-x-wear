"use client"

import { notFound } from "next/navigation";
import { ProductType } from "../types/ProductType";
import { ProductContent } from "@/components/bussiness/ProductDetails";
import { Suspense, use } from "react";
import { useGlobalLoading } from "@/components/common/LoadingProvider";

export interface ProductPageProps {
  params: { id: string };
  searchParams: Promise<{ data?: string }>;
}

function ProductPageContent({ searchParams }: { searchParams: Promise<{ data?: string }> }) {
  const { hide } = useGlobalLoading();
  const resolvedParams = use(searchParams);
  if (!resolvedParams?.data) return notFound();

  try {
    const product: ProductType = JSON.parse(resolvedParams.data);
    // Hide any global route-transition loader once details are ready
    // Use a microtask to ensure effects after render start
    queueMicrotask(() => hide());
    return <ProductContent product={product} />;
  } catch (e) {
    return notFound();
  }
}

export default function ProductPage({ searchParams }: ProductPageProps) {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <div className="absolute inset-0 animate-pulse bg-muted" />
            </div>
            <div className="space-y-4">
              <div className="h-8 w-2/3 bg-muted rounded animate-pulse" />
              <div className="h-6 w-1/2 bg-muted rounded animate-pulse" />
              <div className="h-24 w-full bg-muted rounded animate-pulse" />
              <div className="h-10 w-full bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      }
    >
      <ProductPageContent searchParams={searchParams} />
    </Suspense>
  );
}
