import { pgTable, uuid, text, decimal, timestamp, integer, boolean, jsonb, numeric } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Users table (extends Supabase auth.users)
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  phoneNumber: text('phone_number').unique(),
  city: text('city'),
  userAddress: text('user_address'),
  pinCode: numeric('pin_code'),
  role: text('role').default('USER'),
  country: text('country').default('India'),
  userId: uuid('user_id').notNull().unique(),
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
   is_trendy: boolean('is_trendy').default(false),
  // SEO
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  calculatedPrice: numeric('calculated_price', { precision: 12, scale: 2 }),
});

// Orders table
// db/schema/orders.ts


export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").references(() => users.userId),   // link to users.user_id per SQL schema
  order_number: text("order_number").notNull().unique(),
  status: text("status").notNull().default("pending"),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  tax: numeric("tax", { precision: 12, scale: 2 }).default("0"),
  shipping: numeric("shipping", { precision: 12, scale: 2 }).default("0"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  payment_status: text("payment_status").default("pending"),
  notes: jsonb("notes"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});


// Order items table
//
// 2. Order Items
//
export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  order_id: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  product_id: uuid("product_id")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull(), // integer per SQL schema
  size: text("size"),
  color: text("color"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  product_snapshot: jsonb("product_snapshot"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
export const orderPayments = pgTable("order_payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  order_id: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  gateway: text("gateway").notNull(), // 'cashfree', 'stripe'
  payment_ref: text("payment_ref"),    // external payment ID
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").default("INR"),
  status: text("status").notNull().default("pending"),
  method: text("method"),             // UPI, card, netbanking
  payload: jsonb("payload"),
  verified: boolean("verified").default(false),
  failure_reason: text("failure_reason"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
//
// 4. Refunds
//
export const refunds = pgTable("refunds", {
  id: uuid("id").defaultRandom().primaryKey(),
  payment_id: uuid("payment_id")
    .notNull()
    .references(() => orderPayments.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  reason: text("reason"),
  status: text("status").default("pending"),
  refund_ref: text("refund_ref"), // external refund ID
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
//
// 5. Webhook Logs
//
export const webhookLogs = pgTable("webhook_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  event_type: text("event_type"),
  headers: jsonb("headers"),
  payload: jsonb("payload"),
  verified: boolean("verified").default(false),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  payment_id: uuid("payment_id").references(() => orderPayments.id, {
    onDelete: "cascade",
  }),
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