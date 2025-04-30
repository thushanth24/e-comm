import { z } from 'zod';

// Category schema validation
export const categorySchema = z.object({
  name: z.string().min(2, { message: "Category name must be at least 2 characters long" }),
  slug: z.string().min(2).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must contain only lowercase letters, numbers, and hyphens",
  }),
});

// Product schema validation
export const productSchema = z.object({
  name: z.string().min(3, { message: "Product name must be at least 3 characters long" }),
  slug: z.string().min(3).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must contain only lowercase letters, numbers, and hyphens",
  }),
  price: z.coerce.number().positive({ message: "Price must be a positive number" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }),
  inventory: z.coerce.number().int().nonnegative({ message: "Inventory must be a non-negative integer" }),
  categoryId: z.coerce.number().positive({ message: "You must select a category" }),
  featured: z.boolean().optional(),
  images: z.array(z.string().url({ message: "Invalid image URL" })).min(1, { message: "At least one image is required" }),
});

// Search query validation
export const searchQuerySchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
});

// Image upload validation
export const imageUploadSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().regex(/^image\/(jpeg|png|gif|webp)$/, {
    message: "File must be a valid image (JPEG, PNG, GIF, WEBP)"
  }),
});
