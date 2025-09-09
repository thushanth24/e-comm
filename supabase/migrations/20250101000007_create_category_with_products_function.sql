-- Create an optimized function to get category with products and pagination
CREATE OR REPLACE FUNCTION public.get_category_with_products(
  category_slug text,
  page integer DEFAULT 1,
  page_size integer DEFAULT 24
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  offset_val integer;
BEGIN
  -- Calculate offset for pagination
  offset_val := (page - 1) * page_size;
  
  WITH RECURSIVE category_hierarchy AS (
    -- Base case: find the category by slug
    SELECT id, name, slug, "parentId", "createdAt", "updatedAt", description
    FROM "Category" 
    WHERE slug = category_slug
    
    UNION ALL
    
    -- Recursive case: find all child categories
    SELECT c.id, c.name, c.slug, c."parentId", c."createdAt", c."updatedAt", c.description
    FROM "Category" c
    INNER JOIN category_hierarchy ch ON c."parentId" = ch.id
  ),
  category_data AS (
    SELECT * FROM category_hierarchy WHERE slug = category_slug LIMIT 1
  ),
  all_category_ids AS (
    SELECT id FROM category_hierarchy
  ),
  products_data AS (
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.description,
      p.price,
      p.inventory,
      p."categoryId",
      p."createdAt",
      p."updatedAt",
      p.featured as "isFeatured",
      jsonb_agg(
        jsonb_build_object(
          'id', pi.id,
          'public_url', pi."public_url",
          'is_primary', COALESCE(pi."is_primary", false),
          'position', COALESCE(pi."position", 0),
          'productId', pi."productId"
        )
      ) FILTER (WHERE pi.id IS NOT NULL) as images
    FROM "Product" p
    LEFT JOIN "ProductImage" pi ON p.id = pi."productId"
    WHERE p."categoryId" IN (SELECT id FROM all_category_ids)
    GROUP BY p.id, p.name, p.slug, p.description, p.price, p.inventory, p."categoryId", p."createdAt", p."updatedAt", p.featured
    ORDER BY p."createdAt" DESC
    LIMIT page_size OFFSET offset_val
  ),
  total_products_count AS (
    SELECT COUNT(*) as total
    FROM "Product" p
    WHERE p."categoryId" IN (SELECT id FROM all_category_ids)
  ),
  child_categories AS (
    SELECT id, name, slug, "parentId", "createdAt", "updatedAt", description
    FROM "Category" 
    WHERE "parentId" = (SELECT id FROM category_data)
  ),
  parent_category AS (
    SELECT id, name, slug, "parentId", "createdAt", "updatedAt", description
    FROM "Category" 
    WHERE id = (SELECT "parentId" FROM category_data)
  )
  SELECT jsonb_build_object(
    'category', (SELECT row_to_json(cd) FROM category_data cd),
    'products', (SELECT jsonb_agg(row_to_json(pd)) FROM products_data pd),
    'childCategories', (SELECT jsonb_agg(row_to_json(cc)) FROM child_categories cc),
    'parentCategory', (SELECT row_to_json(pc) FROM parent_category pc),
    'pagination', jsonb_build_object(
      'page', page,
      'pageSize', page_size,
      'total', (SELECT total FROM total_products_count),
      'totalPages', CEIL((SELECT total FROM total_products_count)::float / page_size)
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_category_with_products(text, integer, integer) TO authenticated;

-- Add a comment to document the function
COMMENT ON FUNCTION public.get_category_with_products(text, integer, integer) IS 'Returns category data with products, child categories, parent category, and pagination info in a single optimized query.';
