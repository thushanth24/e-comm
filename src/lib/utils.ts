import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Combine tailwind classes with clsx and tailwind-merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price to currency format in Sri Lankan Rupees (LKR)
export function formatPrice(price: number): string {
  return 'Rs. ' + new Intl.NumberFormat('en-LK', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

// Generate slug from string
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Get random items from an array
export function getRandomItems<T>(array: T[], count: number): T[] {
  return [...array].sort(() => 0.5 - Math.random()).slice(0, count);
}
