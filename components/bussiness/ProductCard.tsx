import React from "react";
import Image from "next/image";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { ProductCardType } from "@/app/types/ProductType";

export const ProductCard: React.FC<ProductCardType> = ({
  id,
  mainImageUrl,
  name,
  slug,
  description,
  price,
  compareAtPrice,
  categoryId,
  sizes,
  colors,
  stockQuantity,
  trackQuantity,
  isActive,
  isFeatured,
  discount,
  metaTitle,
  metaDescription,
  createdAt,
  updatedAt,
  item = {},
  calculatedPrice,
}) => {
  return (
    <>
      {/* Card */}
      <Link
        href={{
          pathname: `/${id}`,
          query: { data: JSON.stringify(item) },
        }}
        className="flex w-full min-w-[140px] max-w-[350px] flex-auto group"
      >
        <Card className="w-full flex-1 overflow-hidden p-0 transition-transform duration-300 ease-out hover:translate-y-[-2px] hover:shadow-md">
          <div className="relative w-full aspect-square bg-accent/20">
            <Image
              src={mainImageUrl}
              alt={name}
              fill
              sizes="(min-width: 1024px) 25vw,
                     (min-width: 768px) 33vw,
                     (min-width: 640px) 50vw,
                     100vw"
              className="object-cover object-center transition-transform duration-300 ease-in-out group-hover:scale-[1.03]"
              priority
            />
            {discount > 0 && (
              <Badge className="absolute top-2 left-2" variant="secondary">
                {discount}% OFF
              </Badge>
            )}
          </div>

          <CardContent className="flex flex-col py-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
              <h6 className="text-sm sm:text-base font-semibold leading-tight truncate max-w-[180px]">
                {name}
              </h6>
              <div className="flex items-center gap-1.5 mt-0.5 sm:mt-0 shrink-0">
                <span className="text-xs sm:text-sm font-medium">
                  ₹ {Number(calculatedPrice).toLocaleString()}
                </span>
                {discount > 0 && (
                  <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
                    ₹ {parseFloat(price).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            <p className="line-clamp-2 text-[11px] sm:text-sm text-muted-foreground">
              {description}
            </p>
          </CardContent>
        </Card>
      </Link>
    </>
  );
};
