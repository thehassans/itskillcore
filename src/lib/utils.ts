import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
export const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const plain = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
export const finalPrice = (c: { price: number; discountPrice?: number | null }) =>
  c.discountPrice != null && c.discountPrice < c.price ? c.discountPrice : c.price;
export const readTime = (text?: string) => Math.max(1, Math.round((text ?? "").split(/\s+/).length / 200));
