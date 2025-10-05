"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase-browser";
import Image from "next/image";
import { X, Search, PackageOpen, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProductSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  // Helper to format INR price consistently
  const formatPrice = (val?: number | null) => {
    if (typeof val !== "number") return "";
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(val);
    } catch {
      return `₹${val}`;
    }
  };
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mobileActive, setMobileActive] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const listboxId = "product-search-listbox";

  const debouncedQuery = useDebounce(query, 400);

  // Track viewport to switch mobile/desktop behavior responsively
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    let t: number | undefined;
    const onResize = () => {
      if (t) window.clearTimeout(t);
      t = window.setTimeout(update, 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (t) window.clearTimeout(t);
    };
  }, []);

  // Fetch products
  useEffect(() => {
    let isCancelled = false;
    const fetchProducts = async () => {
      if (!debouncedQuery.trim()) {
        if (isCancelled) return;
        setResults([]);
        setIsOpen(false);
        setErrorMsg(null);
        return;
      }

      setIsLoading(true);
      setErrorMsg(null);

      let queryBuilder = supabase
        .from("products")
        .select("id,name,description,main_image_url,price,calculated_price,slug");

      // Check for "under X" price queries
      const underMatch = debouncedQuery.toLowerCase().match(/under\s*(\d+)/);
      if (underMatch) {
        const priceLimit = underMatch[1];
        queryBuilder = queryBuilder.lte("calculated_price", priceLimit);
      } else {
        // Search by name or description
        queryBuilder = queryBuilder.or(
          `name.ilike.%${debouncedQuery}%,description.ilike.%${debouncedQuery}%`
        );
      }

      const { data, error } = await queryBuilder.limit(10);

      if (isCancelled) return;

      if (error) {
        // Minimal error handling, avoid sensitive logs
        console.error("ProductSearch fetch error:", error?.message || error);
        setErrorMsg("Unable to fetch products. Please try again.");
        setResults([]);
        setIsOpen(false);
      } else {
        setResults(data || []);
        setIsOpen(!!data && data.length > 0);
        setActiveIndex(-1);
      }

      setIsLoading(false);
    };

    fetchProducts();
    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery]);

  // Keyboard navigation and actions for accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < results.length) {
        const p = results[activeIndex];
        router.push(`/${p.slug || p.id}`);
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Outside click close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className="relative" role="search" aria-label="Product search">
      {/* Desktop / Tablet */}
      {!isMobile && (
        <div className="relative w-auto">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search products..."
            aria-label="Search products"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-autocomplete="list"
            className="pl-10 pr-8 border-0 bg-background"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden />
          {isLoading && (
            <Loader2 className="absolute right-8 top-2.5 h-4 w-4 animate-spin text-muted-foreground" aria-hidden />
          )}
          {query && (
            <X
              className="absolute right-3 top-2.5 h-4 w-4 cursor-pointer text-muted-foreground"
              onClick={() => {
                setQuery("");
                setIsOpen(false);
              }}
              aria-label="Clear search"
              role="button"
              tabIndex={0}
            />
          )}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="absolute mt-2 w-full rounded-md bg-background shadow-lg z-50"
                role="listbox"
                id={listboxId}
              >
                {results.length > 0 ? (
                  results.map((p, idx) => (
                    <Link
                      key={p.id}
                      href={{
                        pathname: `/${p?.id}`,
                        query: { data: JSON.stringify(p) },
                      }}
                    >
                      <div
                        className={`flex items-center gap-3 p-2 hover:bg-accent cursor-pointer ${activeIndex === idx ? "bg-accent" : ""}`}
                        role="option"
                        aria-selected={activeIndex === idx}
                        id={`product-search-option-${idx}`}
                      >
                        <Image
                          src={p.main_image_url || "/placeholder.png"}
                          alt={p.name}
                          width={40}
                          height={40}
                          className="rounded"
                        />
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{formatPrice(p.calculated_price ?? p.price)}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
                    <PackageOpen className="h-6 w-6" aria-hidden />
                    <p className="text-sm">No products found</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          {errorMsg && (
            <p className="mt-2 text-xs text-destructive" role="alert">{errorMsg}</p>
          )}
        </div>
      )}

      {/* Mobile */}
      {isMobile && (
        <>
          {!mobileActive && (
            <button className="p-2" onClick={() => setMobileActive(true)} aria-label="Open search">
              <Search className="h-5 w-5" aria-hidden />
            </button>
          )}
          <AnimatePresence>
            {mobileActive && (
              <motion.div
                initial={{ y: "-100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-100%" }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[1000] bg-background p-4"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-muted-foreground" aria-hidden />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search products..."
                    autoFocus
                    aria-label="Search products"
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-controls={listboxId}
                    aria-autocomplete="list"
                    className="flex-1 border-0 bg-background focus-visible:ring-0"
                  />
                  {isLoading && (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden />
                  )}
                  <X
                    className="h-5 w-5 cursor-pointer text-muted-foreground"
                    onClick={() => {
                      setMobileActive(false);
                      setQuery("");
                      setIsOpen(false);
                    }}
                    aria-label="Close search"
                    role="button"
                    tabIndex={0}
                  />
                </div>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4 bg-background rounded-md shadow-lg"
                      role="listbox"
                      id={listboxId}
                    >
                      {results.length > 0 ? (
                        results.map((p, idx) => (
                          <Link
                            key={p.id}
                             href={{
                        pathname: `/${p?.id}`,
                        query: { data: JSON.stringify(p) },
                      }}
                          >
                            <div
                              className={`flex items-center gap-3 p-2 hover:bg-accent cursor-pointer ${activeIndex === idx ? "bg-accent" : ""}`}
                              role="option"
                              aria-selected={activeIndex === idx}
                              id={`product-search-option-${idx}`}
                            >
                              <Image
                                src={p.main_image_url || "/placeholder.png"}
                                alt={p.name}
                                width={40}
                                height={40}
                                className="rounded"
                              />
                              <div>
                                <p className="text-sm font-medium">{p.name}</p>
                                <p className="text-xs text-muted-foreground">{formatPrice(p.calculated_price ?? p.price)}</p>
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
                          <PackageOpen className="h-6 w-6" aria-hidden />
                          <p className="text-sm">No products found</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                {errorMsg && (
                  <p className="mt-2 text-xs text-destructive" role="alert">{errorMsg}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
