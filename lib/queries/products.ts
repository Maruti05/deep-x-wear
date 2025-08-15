import { db } from '@/lib/db';
import { products, categories } from '@/lib/db/schema';
import { eq, and, ilike, desc } from 'drizzle-orm'; // Use the main Drizzle ORM package

export async function getProducts(options: {
  categoryId?: string;
  featured?: boolean;
  search?: string;
  limit?: number;
} = {}) {
  let query = db.select().from(products);

  // Apply filters
  const conditions = [eq(products.isActive, true)];
  
  if (options.categoryId) {
    conditions.push(eq(products.categoryId, options.categoryId));
  }
  
  if (options.featured) {
    conditions.push(eq(products.isFeatured, true));
  }
  
  if (options.search) {
    conditions.push(ilike(products.name, `%${options.search}%`));
  }

  const result = await query
    .where(and(...conditions))
    .orderBy(desc(products.createdAt))
    .limit(options.limit || 50);

  return result;
}

export async function getProductBySlug(slug: string) {
  const result = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.isActive, true)))
    .limit(1);

  return result[0];
}

export async function getProductWithCategory(productId: string) {
  const result = await db
    .select({
      product: products,
      category: categories,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.id, productId))
    .limit(1);

  return result[0];
}
// ...existing code...

export async function getProductById(productId: string) {
  const result = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  return result[0];
}

//