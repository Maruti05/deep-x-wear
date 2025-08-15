"use client";

import { useState, useEffect, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import { X, Search, PackageOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function ProductSearch() {
  const supabase = createClientComponentClient();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mobileActive, setMobileActive] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 400);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      let queryBuilder = supabase
        .from("products")
        .select(
          "*"
        );

      // Check for "under X" price queries
      const underMatch = debouncedQuery.toLowerCase().match(/under\s*(\d+)/);
      if (underMatch) {
        console.log(
          `Searching for products under ₹${underMatch[1]}`,
          debouncedQuery
        );

        const priceLimit = underMatch[1];
        queryBuilder = queryBuilder.lte("calculated_price", priceLimit);
      } else {
        // Search by name or description
        queryBuilder = queryBuilder.or(
          `name.ilike.%${debouncedQuery}%,description.ilike.%${debouncedQuery}%`
        );
      }

      const { data, error } = await queryBuilder.limit(10);

      if (error) {
        console.error(error);
        return;
      }
      setResults(data || []);
      setIsOpen(true);
    };

    fetchProducts();
  }, [debouncedQuery, supabase]);

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

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div ref={searchRef} className="relative">
      {/* Desktop / Tablet */}
      {!isMobile && (
        <div className="relative w-auto">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="pl-10 pr-8 border-0 bg-background"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          {query && (
            <X
              className="absolute right-3 top-2.5 h-4 w-4 cursor-pointer text-muted-foreground"
              onClick={() => {
                setQuery("");
                setIsOpen(false);
              }}
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
              >
                {results.length > 0 ? (
                  results.map((p) => (
                      <Link
                            href={{
                              pathname: `/${p.id}`,
                              query: { data: JSON.stringify(p) },
                            }}
                          >
                    <div
                      key={p.id}
                      className="flex items-center gap-3 p-2 hover:bg-accent cursor-pointer"
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
                        <p className="text-xs text-muted-foreground">
                          ₹{p.price}
                        </p>
                      </div>
                    </div>
                    </Link>
                  ))
                ) : (
                  <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
                    <PackageOpen className="h-6 w-6" />
                    <p className="text-sm">No products found</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Mobile */}
      {isMobile && (
        <>
          {!mobileActive && (
            <button className="p-2" onClick={() => setMobileActive(true)}>
              <Search className="h-5 w-5" />
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
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products..."
                    autoFocus
                    className="flex-1 border-0 bg-background focus-visible:ring-0"
                  />
                  <X
                    className="h-5 w-5 cursor-pointer text-muted-foreground"
                    onClick={() => {
                      setMobileActive(false);
                      setQuery("");
                      setIsOpen(false);
                    }}
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
                    >
                      {results.length > 0 ? (
                        results.map((p) => (
                          <Link
                            href={{
                              pathname: `/${p.id}`,
                              query: { data: JSON.stringify(p) },
                            }}
                          >
                            <div
                              key={p.id}
                              className="flex items-center gap-3 p-2 hover:bg-accent cursor-pointer"
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
                                <p className="text-xs text-muted-foreground">
                                  ₹{p.price}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
                          <PackageOpen className="h-6 w-6" />
                          <p className="text-sm">No products found</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
