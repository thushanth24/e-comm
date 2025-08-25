export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  parent?: Category;
  children?: Category[];
}

/**
 * Recursively builds the full path for a category (e.g., "Men > Formal > Shirts")
 * @param category The category object
 * @param categories All categories as a flat array (optional, used for backward compatibility)
 * @returns The full path as a string
 */
export function getCategoryPath(category: Category, categories?: Category[]): string {
  if (!category) return '';
  
  const path = [category.name];
  
  if (category.parentId) {
    if (categories) {
      // Fallback for flat category arrays
      let current = categories.find(c => c.id === category.parentId);
      while (current) {
        path.unshift(current.name);
        current = categories.find(c => c.id === current?.parentId);
      }
    } else if (category.parent) {
      // Handle nested category structure
      let current: Category | undefined = category.parent;
      while (current) {
        path.unshift(current.name);
        current = current.parent;
      }
    }
  }
  
  return path.join(' > ');
}
