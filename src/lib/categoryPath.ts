interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  children?: Category[];
}

/**
 * Recursively builds the full path for a category (e.g., "Men > Formal > Shirts")
 * @param categoryId The target category's ID
 * @param categories All categories as a flat array
 * @returns The full path as a string
 */
export function getCategoryPath(categoryId: number | string, categories: Category[]): string {
  const category = categories.find(cat => cat.id.toString() === categoryId.toString());
  if (!category) return '';
  
  let path = [category.name];
  let currentCategory = category;
  
  while (currentCategory.parent_id) {
    const parent = categories.find(cat => cat.id === currentCategory.parent_id);
    if (!parent) break;
    
    path.unshift(parent.name);
    currentCategory = parent;
  }
  
  return path.join(' > ');
}
