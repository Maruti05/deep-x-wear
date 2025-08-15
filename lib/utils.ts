import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getBase64string = (data: any) => {
  const arrayBuffer = new Uint8Array(data);
  // Convert Uint8Array to binary string safely
  const binaryString = arrayBuffer.reduce(
    (acc, byte) => acc + String.fromCharCode(byte),
    ""
  );
  // Convert binary string to Base64
  const base64String = btoa(binaryString).trimEnd();

  // Create Base64 Image Source
  return `data:image/jpeg;base64,${base64String}`;
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace and replace by -
    .replace(/-+/g, "-"); // collapse dashes
}

export const getDiscountedPrice = (price: string, discount: number): number => {
  const numericPrice = Number(price);
  if (discount <= 0) return Math.round(numericPrice);

  const discounted = numericPrice - (numericPrice * discount) / 100;
  return Math.round(discounted); // rounds up if .5 or higher
};
