"use client";

import Image from "next/image";
import { ProductType } from "@/app/types/ProductType";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getDiscountedPrice } from "@/lib/utils";
import { useCart } from "@/app/context/CartContext";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useGlobalLoading } from "@/components/common/LoadingProvider";
import { useUpdateCartItemsMutation } from "@/hooks/useCart";

export function ProductContent({ product }: { product: ProductType }) {
  const navigate = useRouter();
  const { addToCart } = useCart();
  const { show, hide } = useGlobalLoading();
  const [cartId, setCartId] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCartId(localStorage.getItem("cart_id"));
    }
  }, []);
  const updateItemsMutation = useUpdateCartItemsMutation(cartId ?? "unknown");
  const [size, setSize] = useState(product.sizes[0]);
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const [quantity, setQuantity] = useState(0);
  const [isAddToCartClicked, setIsAddToCartClicked] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleAddToCart = async () => {
    if (isAddToCartClicked) {
      navigate.push("/cart");
      return;
    }


     if (!cartId) {
       toast.error('No cart found. Please login to create your cart.');
       return;
     }

     const newItem = {
       productId: product.id,
       name: product.name,
       price: product.price,
       mainImageUrl: product.mainImageUrl,
       size,
       color,
       quantity,
       discount: product.discount,
       calculatedPrice: product.calculatedPrice,
       stockQuantity: product.stockQuantity,
     };

     // Optimistic update
     addToCart(newItem);
 
     try {
       setSyncing(true);
       show();

      await updateItemsMutation.mutateAsync([
        {
          product_id: product.id,
          quantity,
          size,
          color,
        },
      ]);
 
       toast.success(`${product.name} added to cart!`, { duration: 3000 });
       setIsAddToCartClicked(true);
     } catch (err) {
       console.error(err);
       toast.error('Could not sync with backend.');
     } finally {
       setSyncing(false);
       hide();
     }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Image */}
        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
          {!imageReady && (
            <div className="absolute inset-0 animate-pulse bg-muted" />
          )}
          {product.mainImageUrl && (
            <Image
              src={product.mainImageUrl}
              alt={product.name}
              fill
              className="object-cover"
              priority
              onLoad={() => setImageReady(true)}
              onLoadingComplete={() => setImageReady(true)}
            />
          )}
        </div>

        {/* Right Column - Product Details */}
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-semibold">
                {" "}
                ₹
                {Number(product.calculatedPrice).toLocaleString()}
              </p>
              {product.price && (
                <p className="text-lg text-muted-foreground line-through">
                  ₹{parseInt(product.price).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Select Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sizeOption) => (
                    <Badge
                      key={sizeOption}
                      variant={size === sizeOption ? "default" : "secondary"}
                      className="cursor-pointer hover:opacity-80"
                      onClick={() => setSize(sizeOption)}
                    >
                      {sizeOption}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Select Color</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((colorOption) => (
                    <div
                      key={colorOption.code}
                      className={`flex items-center gap-1.5 p-2 rounded-md cursor-pointer hover:bg-accent ${
                        color === colorOption.name ? "bg-accent" : ""
                      }`}
                      onClick={() => setColor(colorOption.name)}
                    >
                      <div
                        className={`w-6 h-6 rounded-full border ${
                          color === colorOption.name
                            ? "ring-2 ring-primary ring-offset-2"
                            : ""
                        }`}
                        style={{ backgroundColor: colorOption.code }}
                      />
                      <span className="text-sm">{colorOption.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selection */}
            <div>
              <h3 className="font-semibold mb-2">Quantity</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(0, quantity - 1))}
                  disabled={quantity === 0}
                >
                  -
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setQuantity(Math.min(product.stockQuantity, quantity + 1))
                  }
                  disabled={quantity >= product.stockQuantity}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stockQuantity > 0 ? (
                <Badge variant="success" className="flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  In Stock ({product.stockQuantity} available)
                </Badge>
              ) : (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>

            {/* Add to Cart Button */}
            <Button
              size="lg"
              className="w-full mt-4"
              disabled={
                syncing || product.stockQuantity === 0 || quantity === 0 || !size || !color
              }
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {syncing
                ? "Adding..."
                : quantity === 0
                ? "Select Quantity"
                : !size
                ? "Select Size"
                : !color
                ? "Select Color"
                : isAddToCartClicked
                ? "Go to Cart"
                : "Add to Cart"}
            </Button>
          </div>

          {/* Additional Details */}
          <Separator className="my-4" />
        </div>
      </div>
    </div>
  );
}
