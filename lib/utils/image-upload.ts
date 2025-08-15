import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function uploadProductImage(
  file: File,
  productId: string,
  imageType: 'main' | 'gallery' = 'main'
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${imageType}_${Date.now()}.${fileExt}`;
  const filePath = `products/${productId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function deleteProductImage(imageUrl: string): Promise<void> {
  // Extract path from URL
  const urlParts = imageUrl.split('/');
  const filePath = urlParts.slice(-3).join('/'); // products/productId/filename

  const { error } = await supabase.storage
    .from('product-images')
    .remove([filePath]);

  if (error) {
    throw new Error(`Image deletion failed: ${error.message}`);
  }
}