import { pgTable, uuid, text, decimal, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Users table (extends Supabase auth.users)
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Categories table
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Products table
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal('compare_at_price', { precision: 10, scale: 2 }),
  categoryId: uuid('category_id').references(() => categories.id),
  discount: integer('discount').default(0), // Percentage discount
  // Images stored in Supabase Storage
  mainImageUrl: text('main_image_url'),
  imageUrls: text('image_urls').array(),
  
  // Product variants (sizes, colors)
  sizes: text('sizes').array().default(['S', 'M', 'L', 'XL']),
  colors: jsonb('colors').default([]),
  
  // Inventory
  stockQuantity: integer('stock_quantity').default(0),
  trackQuantity: boolean('track_quantity').default(true),
  
  // Status
  isActive: boolean('is_active').default(true),
  isFeatured: boolean('is_featured').default(false),
  
  // SEO
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  calculatedPrice: integer('calculated_price'),
});

// Orders table
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  
  // Order details
  orderNumber: text('order_number').notNull().unique(),
  status: text('status').notNull().default('pending'), // pending, processing, shipped, delivered, cancelled
  
  // Totals
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  tax: decimal('tax', { precision: 10, scale: 2 }).default('0'),
  shipping: decimal('shipping', { precision: 10, scale: 2 }).default('0'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  
  // Customer info
  customerEmail: text('customer_email').notNull(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone'),
  
  // Shipping address
  shippingAddress: jsonb('shipping_address').notNull(),
  
  // Payment
  paymentStatus: text('payment_status').default('pending'), // pending, paid, failed, refunded
  paymentIntentId: text('payment_intent_id'), // Stripe payment intent ID
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Order items table
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id),
  productId: uuid('product_id').references(() => products.id),
  
  // Item details
  quantity: integer('quantity').notNull(),
  size: text('size').notNull(),
  color: text('color'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  
  // Product snapshot (in case product details change)
  productSnapshot: jsonb('product_snapshot'),
  
  createdAt: timestamp('created_at').defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);

export const insertOrderSchema = createInsertSchema(orders);
export const selectOrderSchema = createSelectSchema(orders);

export const insertOrderItemSchema = createInsertSchema(orderItems);
export const selectOrderItemSchema = createSelectSchema(orderItems);