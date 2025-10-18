export const QUERY_KEYS = {
  products: () => ["products"] as const,
  userDetails: () => ["user-details"] as const,
  cart: (cartId: string) => ["cart", cartId] as const,
  ordersHistory: (userId: string, page: number, pageSize: number) => ["orders-history", userId, page, pageSize] as const,
} as const;