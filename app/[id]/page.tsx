"use client"

import { notFound } from "next/navigation";
import { ProductType } from "../types/ProductType";
import { ProductContent } from "@/components/bussiness/ProductDetails";
import { use } from "react";

export interface ProductPageProps {
  params: { id: string };
  searchParams: Promise<{ data?: string }>;
}

export default function ProductPage({ params, searchParams }: ProductPageProps) {
  const resolvedParams = use(searchParams);
  
  if (!resolvedParams.data) return notFound();
  
  const product: ProductType = JSON.parse(resolvedParams.data);
  return <ProductContent product={product} />;
}
