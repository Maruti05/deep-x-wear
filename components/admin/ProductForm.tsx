"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; // 1. Import Switch
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, UploadCloud, X } from "lucide-react";
import { createClient } from '@supabase/supabase-js';
import { cn, slugify } from "@/lib/utils";
import { toast } from "sonner";
import { Row } from "./ProductTable";
import { useGlobalLoading } from "../common/LoadingProvider";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* --------------------------------------------------------------------- */
// 2. Add is_trendy to the Zod schema
const createProductSchema = (isEditing: boolean) => z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be > 0"),
  discount: z.coerce.number().min(0).max(100),
  stock_quantity: z.coerce.number().int().min(0),
  remaining_quantity: z.coerce.number().int().min(0),
  category_id: z.string().min(1, "Category is required"),
  colors: z.array(z.object({
    name: z.string(),
    code: z.string()
  })).min(1, "Select at least one color"),
  sizes: z.array(z.enum(["S", "M", "L", "XL", "XXL", "XXXL"])).min(1, "Select at least one size"),
  is_trendy: z.boolean().optional(), // Added field
  main_image_url: z.string().optional(),
  imageFile: isEditing
    ? z.instanceof(File).optional()
    : z.instanceof(File, { message: "Please select an image" }),
});
export type ProductFormValues = z.infer<ReturnType<typeof createProductSchema>>;

/* --------------------------------------------------------------------- */
export function ProductForm({
  product = null,
  onSaved,
  categories
}: {
  // Assuming 'Row' type might include is_trendy
  product?: (Row & { is_trendy?: boolean }) | null;
  onSaved?: () => void;
  categories?: { id: string; name: string }[];
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(createProductSchema(!!product)),
    mode: "onTouched",
    // 3. Set default value for is_trendy
    defaultValues: product ? {
      name: product.name,
      description: product.description,
      price: product.price,
      discount: product.discount,
      stock_quantity: product.stock_quantity,
      remaining_quantity: product.remaining_quantity,
      category_id: product.category_id,
      colors: product.colors,
      sizes: product.sizes as ("S" | "M" | "L" | "XL" | "XXL" | "XXXL")[],
      is_trendy: product.is_trendy ?? false, // Handle existing product
      main_image_url: product.main_image_url,
    } : {
      is_trendy: false, // Default for new product
    }
  });

  const { show, hide } = useGlobalLoading();
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  async function uploadImage(file: File): Promise<string> {
    const ext = file.name.split(".").pop();
    const uuid = crypto.randomUUID();
    const path = `product-images/prod-${uuid}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("url-blob")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("url-blob")
      .getPublicUrl(path);

    if (!publicUrlData || !publicUrlData.publicUrl) throw new Error("Failed to get public URL");

    return publicUrlData.publicUrl;
  }

  const onSubmit = async (data: ProductFormValues) => {
    setLoading(true);
    setErrorMsg(null);
    show();
    try {
      let finalImageUrl = product?.main_image_url;
      if (data.imageFile instanceof File) {
        finalImageUrl = await uploadImage(data.imageFile);
        setValue("main_image_url", finalImageUrl);
      }
      
      // 5. Add is_trendy to the data object for submission
      const productData = {
        name: data.name,
        description: data.description,
        price: data.price,
        discount: data.discount,
        stock_quantity: data.stock_quantity,
        remaining_quantity: data.remaining_quantity,
        sizes: data.sizes,
        colors: data.colors,
        is_trendy: data.is_trendy ?? false, // Ensure it's a boolean
        main_image_url: finalImageUrl,
        category_id: data.category_id,
        slug: slugify(data.name),
      };

      if (product?.id) {
        await supabase
          .from("products")
          .update(productData)
          .eq('id', product.id);
        toast.success("Product updated successfully");
      } else {
        await supabase
          .from("products")
          .insert(productData);
        toast.success("Product created successfully");
      }
      onSaved?.();
    } catch (err: any) {
      setErrorMsg(err.message ?? "Upload failed");
      toast.error("Something went wrong")
    } finally {
      setLoading(false);
      hide();
    }
  };

  return (
    <Card className="max-w-2xl mx-auto border-none">
      <CardContent className="space-y-4 pt-6">
        {errorMsg && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register("description")} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="price">Price</Label>
            <Input type="number" step="0.01" id="price" {...register("price")} />
            {errors.price && <p className="text-sm text-red-600">{errors.price.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="discount">Discount %</Label>
            <Input type="number" step="0.1" id="discount" {...register("discount")} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="stock">Stock Quantity</Label>
            <Input id="stock" type="number" {...register("stock_quantity")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="remaining">Remaining Quantity</Label>
            <Input id="remaining" type="number" {...register("remaining_quantity")} />
          </div>
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select onValueChange={(v) => setValue("category_id", v as any, { shouldValidate: true })}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && <p className="text-sm text-red-600">{errors.category_id.message}</p>}
          </div>
        </div>
        {/* Sizes */}
        <div className="grid gap-2">
          <Label>Available Sizes</Label>
          <div className="flex flex-wrap gap-2">
            {(["S", "M", "L", "XL", "XXL", "XXXL"] as const).map((size) => {
              const selectedSizes = watch("sizes") || [];
              const isSelected = selectedSizes.includes(size);

              return (
                <div
                  key={size}
                  onClick={() => {
                    const newSizes = isSelected
                      ? selectedSizes.filter((s) => s !== size)
                      : [...selectedSizes, size];
                    setValue("sizes", newSizes, { shouldValidate: true });
                  }}
                  className={cn(
                    "cursor-pointer rounded-full px-3 py-1 text-sm font-semibold",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {size}
                </div>
              );
            })}
          </div>
          {errors.sizes && <p className="text-sm text-red-600">{errors.sizes.message}</p>}
        </div>
        {/* Colors */}
        <div className="grid gap-2">
          <Label>Available Colors</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { name: "Black", code: "#000000" },
              { name: "White", code: "#FFFFFF" },
              { name: "Beige", code: "#F5F5DC" },
              { name: "Lilac", code: "#CCCCFF" },
              { name: "Yellow", code: "#FFFF00" },
              { name: "Navy blue", code: "#000080" },
              { name: "Gray", code: "#808080" },
              { name: "Orange", code: "#d25625" }
            ].map((color) => {
              const selectedColors = watch("colors") || [];
              const isSelected = selectedColors.some(c => c.code === color.code);

              return (
                <div
                  key={color.code}
                  onClick={() => {
                    const newColors = isSelected
                      ? selectedColors.filter((c) => c.code !== color.code)
                      : [...selectedColors, color];
                    setValue("colors", newColors, { shouldValidate: true });
                  }}
                  className={cn(
                    "cursor-pointer rounded-full p-1 flex items-center gap-2 border",
                    isSelected ? "border-primary" : "border-secondary"
                  )}
                >
                  <div
                    className="w-6 h-6 rounded-full border border-gray-200"
                    style={{ backgroundColor: color.code }}
                  />
                  <span className="pr-2 text-sm">{color.name}</span>
                </div>
              );
            })}
          </div>
          {errors.colors && <p className="text-sm text-red-600">{errors.colors.message}</p>}
        </div>

        {/* 4. Add the Switch component for the 'is_trendy' field */}
        <div className="flex items-center space-x-2 pt-2">
          <Switch
            id="is-trendy"
            checked={watch("is_trendy")}
            onCheckedChange={(checked) => {
              setValue("is_trendy", checked);
            }}
          />
          <Label htmlFor="is-trendy" className="cursor-pointer">
            Mark as a Trendy Product ✨
          </Label>
        </div>

        {/* Image upload */}
        <div className="grid gap-2">
          <Label>Product Image</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setValue("imageFile", file, { shouldValidate: true });
              }
            }}
          />
          {errors.imageFile && <p className="text-sm text-red-600">{errors.imageFile.message as string}</p>}
        </div>
      </CardContent>
      <CardFooter>
        <Button disabled={!isValid || loading} onClick={handleSubmit(onSubmit)} className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} <UploadCloud className="mr-2 h-4 w-4" /> Save Product
        </Button>
      </CardFooter>
    </Card>
  );
}