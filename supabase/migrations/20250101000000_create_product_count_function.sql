-- Create a function to check if a table exists
CREATE OR REPLACE FUNCTION public.table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = $1
  );
END;
$$;

-- Create a function to get product counts by category
CREATE OR REPLACE FUNCTION public.get_products_count_by_category()
RETURNS TABLE (
  category_id bigint,
  count bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.category_id,
    COUNT(*)::bigint as count
  FROM 
    products p
  WHERE 
    p.category_id IS NOT NULL
  GROUP BY 
    p.category_id;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_products_count_by_category() TO authenticated;