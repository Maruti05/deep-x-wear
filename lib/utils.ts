import { AdditionalData } from "@/app/types/User";
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

export function getFriendlyErrorMessage(error: any): string {
  switch (error.code) {
    case "23505":
      if (error.message.includes("users_email_unique")) {
        return "This email is already registered. Please use a different email.";
      }
      return "Duplicate value. Please use a different input.";
    case "23503":
      return "Invalid reference. Please check related data.";
    case "23502":
      return "Missing required field.";
    default:
      return error.message || "An unexpected error occurred.";
  }
}
// helpers/verifyRequiredFields.ts

type RequiredField = keyof Pick<
  AdditionalData,
  "phone_number" | "pin_code" | "state_name" | "user_address" | "city"
>;

export function verifyRequiredFieldsPresent(
  additionalData?: AdditionalData | null
): boolean {
  // Defensive: Ensure object is valid
  if (!additionalData || typeof additionalData !== "object") return false;

  const requiredFields: RequiredField[] = [
    "phone_number",
    "pin_code",
    "state_name",
    "user_address",
    "city",
  ];

  return requiredFields.every((field) => {
    const rawValue = additionalData[field];
    const value = String(rawValue ?? "").trim();

    return value.length > 0;
  });
}


