"use client";
import { ProductCard } from "@/components/bussiness/ProductCard";
import { useGlobalLoading } from "@/components/common/LoadingProvider";
import { useProducts } from "@/hooks/useProducts";
import { useEffect, useMemo } from "react";
import { ProductType } from "./types/ProductType";
import { ResponsiveCarouselWithDots } from "@/components/bussiness/Carousel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  const { show, hide } = useGlobalLoading();
  const { refresh, isError, isLoading, products } = useProducts();

  // Show global loader only while the initial list is loading and no data is yet available
  useEffect(() => {
    const shouldShow = isLoading && (!products || products.length === 0);
    if (shouldShow) {
      show();
    } else {
      hide();
    }
  }, [isLoading, products, show, hide]);

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

  // Skeleton grid while product list loads (initial fetch)
  const renderSkeletonGrid = () => (
    <main className="container mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[8px] sm:gap-4 lg:gap-6 auto-rows-fr mt-4">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div
          key={idx}
          className="opacity-100 translate-y-0 rounded-md border border-border p-2 animate-pulse"
        >
          <div className="aspect-square rounded-md bg-muted mb-2" />
          <div className="h-4 w-3/4 bg-muted rounded mb-1" />
          <div className="h-4 w-1/2 bg-muted rounded" />
        </div>
      ))}
    </main>
  );

  return (
    <div className="min-h-screen px-2 pb-20 pt-4 sm:px-8 sm:pt-12 font-[family-name:var(--font-geist-sans)]">
      {products && trendyImages.length > 0 && (
        <ResponsiveCarouselWithDots items={trendyImages} />
      )}
      {(!products || products.length === 0) && isLoading ? (
        renderSkeletonGrid()
      ) : (
        <div className="container mx-auto mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product list: max height with custom scrollbar */}
          <section className="lg:col-span-2">
            <ScrollArea className="max-h-[72vh] rounded-md border">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-[8px] sm:gap-4 lg:gap-6 p-2">
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
              </div>
            </ScrollArea>
          </section>

          {/* Modern product suggestions with smooth animations */}
          <aside className="space-y-4">
            <h3 className="text-lg font-semibold">Suggested for you</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(products || []).slice(0, 6).map((item: ProductType, i) => (
                <motion.div
                  key={`sugg-${item.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.05 }}
                  className="rounded-md border p-2 hover:shadow-sm bg-background"
                >
                  <Link
                    href={{ pathname: `/${item.id}`, query: { data: JSON.stringify(item) } }}
                    prefetch
                    className="block"
                    onClick={() => show()}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted">
                        <img
                          src={item.mainImageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          ₹ {Number(item.calculatedPrice).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
