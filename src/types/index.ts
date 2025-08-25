export interface ProductImage {
  id: number;
  public_url: string;
  is_primary?: boolean;
  position?: number;
  productId?: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  inventory: number;
  isFeatured: boolean;
  isArchived: boolean;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  // For backward compatibility
  ProductImage?: ProductImage[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: string | null;
  children?: Category[];
  parent?: Category | null;
  parentHierarchy?: Array<{ id: number; name: string; slug: string }>;
}
