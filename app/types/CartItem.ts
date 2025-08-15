export type CartItem = {
  productId: string;
  name: string;
  price: string;
  mainImageUrl: string;
  size: string;
  color: string;
  quantity: number;
  discount?: number;
  calculatedPrice: number | 0; 
  stockQuantity: number |0; 
};
export type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateCartItem: (index: number, updatedItem: Partial<CartItem>) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
};