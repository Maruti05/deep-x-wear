import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {BrandLogo} from "@/components/common/BrandLogo";
import { SearchIcon, HomeIcon } from "lucide-react";
import ProductSearch from "@/components/bussiness/ProductSearch";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-2xl space-y-6 text-center">
        <div className="flex justify-center">
          <BrandLogo />
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-muted-foreground">We couldn't find the page you're looking for. Try searching or navigate to a main section.</p>

        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Link href="/" className="inline-flex">
            <Button variant="outline">Browse Products</Button>
          </Link>
          <Link href="/contact-us" className="inline-flex">
            <Button variant="ghost">Contact Support</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}