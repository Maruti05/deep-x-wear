export interface ColorsType {
  code: string;
  name: string;
}
export interface ProductType {
id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  discount: number;
  compareAtPrice: any;
  categoryId: string;
  mainImageUrl: string;
  imageUrls: any;
  sizes: string[];
  colors: ColorsType[];
  stockQuantity: number;
  trackQuantity: boolean;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle: any;
  metaDescription: any;
  createdAt: string;
  updatedAt: string;
  calculatedPrice: number;
  is_trendy: boolean
}
export interface ProductCardType extends ProductType {
  item?: ProductType;
}