-- Create a function to get new arrivals by category
CREATE OR REPLACE FUNCTION public.get_new_arrivals_by_category(
  category_limit integer DEFAULT 6,
  products_per_category integer DEFAULT 4
)
RETURNS TABLE (
  category_id text,
  category_name text,
  category_slug text,
  product_id text,
  product_name text,
  product_slug text,
  product_description text,
  product_price numeric,
  product_inventory integer,
  product_featured boolean,
  product_created_at timestamptz,
  product_images jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH ranked_products AS (
    SELECT 
      c.id::text as category_id,
      c.name as category_name,
      c.slug as category_slug,
      p.id::text as product_id,
      p.name as product_name,
      p.slug as product_slug,
      p.description as product_description,
      p.price as product_price,
      p.inventory as product_inventory,
      p.featured as product_featured,
      p."createdAt" as product_created_at,
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', pi.id::text,
            'url', pi."public_url",
            'public_url', pi."public_url",
            'productId', pi."productId"::text
          )
        )
        FROM "ProductImage" pi
        WHERE pi."productId" = p.id
      ) as product_images,
      ROW_NUMBER() OVER (
        PARTITION BY c.id 
        ORDER BY p."createdAt" DESC, p.id
      ) as rn
    FROM "Category" c
    JOIN "Product" p ON p."categoryId" = c.id
    WHERE p.inventory > 0
  )
  SELECT 
    rp.category_id,
    rp.category_name,
    rp.category_slug,
    rp.product_id,
    rp.product_name,
    rp.product_slug,
    rp.product_description,
    rp.product_price,
    rp.product_inventory,
    rp.product_featured,
    rp.product_created_at,
    rp.product_images
  FROM ranked_products rp
  WHERE rp.rn <= products_per_category
  ORDER BY 
    rp.category_name,
    rp.rn
  LIMIT category_limit * products_per_category;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_new_arrivals_by_category(integer, integer) TO authenticated;

-- Add a comment to document the function
COMMENT ON FUNCTION public.get_new_arrivals_by_category(integer, integer) IS 'Returns the latest products grouped by category, with configurable limits for the number of categories and products per category.';
