"use client";
import { ProductCard } from "@/components/bussiness/ProductCard";
import { useGlobalLoading } from "@/components/common/LoadingProvider";
import { useProducts } from "@/hooks/useProducts";
import { useEffect, useMemo } from "react";
import { ProductType } from "./types/ProductType";
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

  // Scroll reveal: observe elements with [data-reveal]
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');
    if (!elements.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.classList.add('opacity-100', 'translate-y-0');
            el.classList.remove('opacity-0', 'translate-y-4');
            observer.unobserve(el);
          }
        }
      },
      { root: null, threshold: 0.05, rootMargin: '0px 0px -10% 0px' }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [products]);

  const trendyImages = useMemo(() => {
    return (products || [])
      .filter((i: ProductType) => i.is_trendy)
      .map((item: ProductType) => item.mainImageUrl);
  }, [products]);

  return (
    <div className="min-h-screen px-2 pb-20 pt-4 sm:px-8 sm:pt-12 font-[family-name:var(--font-geist-sans)]">
      {products && trendyImages.length > 0 && (
        <ResponsiveCarouselWithDots items={trendyImages} />
      )}
      <main className="container mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[8px] sm:gap-4 lg:gap-6 auto-rows-fr mt-4">
        {products &&
          products.map((item: ProductType, idx: number) => (
            <div
              key={item.id}
              data-reveal
              className="opacity-0 translate-y-4 transition-all duration-500 ease-out will-change-transform will-change-opacity"
              style={{ transitionDelay: `${Math.min(idx, 20) * 40}ms` }}
            >
              <ProductCard {...item} item={item} />
            </div>
          ))}
      </main>
    </div>
  );
}
