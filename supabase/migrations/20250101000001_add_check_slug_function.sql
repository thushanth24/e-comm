-- First drop the function if it exists
DROP FUNCTION IF EXISTS public.check_category_slug(TEXT);

-- Then create the function with the new return type
CREATE OR REPLACE FUNCTION public.check_category_slug(p_slug TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT to_jsonb(c) INTO result
  FROM "Category" c
  WHERE c."slug" = p_slug
  LIMIT 1;
  
  RETURN COALESCE(result, 'null'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a new category
CREATE OR REPLACE FUNCTION public.create_category(
  p_name TEXT,
  p_slug TEXT,
  p_parent_id INTEGER DEFAULT NULL
) RETURNS SETOF "Category" AS $$
DECLARE
  new_category "Category"%ROWTYPE;
BEGIN
  -- First get the next ID
  SELECT COALESCE(MAX("id"), 0) + 1 INTO STRICT new_category."id" FROM "Category";
  
  -- Set the values
  new_category."name" := p_name;
  new_category."slug" := p_slug;
  new_category."parentId" := p_parent_id;
  new_category."createdAt" := NOW();
  new_category."updatedAt" := NOW();
  
  -- Insert the new category
  INSERT INTO "Category" VALUES (new_category.*);
  
  -- Return the inserted row
  RETURN QUERY SELECT * FROM "Category" WHERE "id" = new_category."id";
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all categories
CREATE OR REPLACE FUNCTION public.get_all_categories()
RETURNS SETOF "Category" AS $$
BEGIN
  RETURN QUERY SELECT * FROM "Category" ORDER BY "id" ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.check_category_slug(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_category(TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_categories() TO authenticated;
