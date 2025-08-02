'server';

import { revalidateTag } from 'next/cache';

export const CACHE_TAGS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
} as const;

export async function revalidateProducts() {
  'server';
  revalidateTag(CACHE_TAGS.PRODUCTS);
  return { revalidated: true, now: Date.now() };
}

export async function revalidateCategories() {
  'server';
  revalidateTag(CACHE_TAGS.CATEGORIES);
  return { revalidated: true, now: Date.now() };
}

export async function revalidateAll() {
  'server';
  revalidateTag(CACHE_TAGS.PRODUCTS);
  revalidateTag(CACHE_TAGS.CATEGORIES);
  return { revalidated: true, now: Date.now() };
}
