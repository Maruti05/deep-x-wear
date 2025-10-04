"use client";
import { ProductCard } from "@/components/bussiness/ProductCard";
import { useGlobalLoading } from "@/components/common/LoadingProvider";
import { useProducts } from "@/hooks/useProducts";
import Image from "next/image";
import { useEffect } from "react";
import { ProductType } from "./types/ProductType";
import { showToast } from "@/lib/sweetalert-theme";
import { ResponsiveCarouselWithDots } from "@/components/bussiness/Carousel";

export default function Home() {
  const { show, hide } = useGlobalLoading();
  const { refresh, isError, isLoading, products } = useProducts();

useEffect(() => {
    if (isLoading) {
      show();
    } else {
      hide();
    }
  }, [isLoading]);
  return (
    <div className="min-h-screen px-2 pb-20 pt-4 sm:px-8 sm:pt-12 font-[family-name:var(--font-geist-sans)]">
    {  products&&<ResponsiveCarouselWithDots
        items={products.filter((i:ProductType)=>i.is_trendy).map((item: ProductType) => item.mainImageUrl)}
      />}
      <main className="container mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[8px] sm:gap-4 lg:gap-6 auto-rows-fr mt-4">
        {products &&
          products.map((item: ProductType) => (
            <ProductCard key={item.id} {...item} item={item} />
          ))}
      </main>
    </div>
  );
}
