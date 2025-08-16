import { z } from 'zod';

// Category schema validation
export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  description: z.string().optional(),
  parent_id: z.number().int().positive().nullable().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// Helper function to validate and normalize image URLs
const normalizeImageUrl = (url: string) => {
  if (!url) return null;
  // If it's already a full URL, return as is
  if (url.startsWith('http')) return url;
  // If it's a path, construct the full URL
  if (url.startsWith('/')) return `https://jegaqqjdtmspoxlrwwaz.supabase.co/storage/v1/object/public/product-images${url}`;
  // Otherwise, assume it's a filename
  return `https://jegaqqjdtmspoxlrwwaz.supabase.co/storage/v1/object/public/product-images/${url}`;
};

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
  images: z
    .array(z.string().min(1, { message: "Image URL cannot be empty" }))
    .min(1, { message: "At least one image is required" })
    .transform(arr => arr
      .map(url => {
        try {
          const normalized = normalizeImageUrl(url);
          return normalized && new URL(normalized).toString();
        } catch {
          return null;
        }
      })
      .filter((url): url is string => url !== null)
    ),
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
