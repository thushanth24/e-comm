-- Update ProductImage table to store Supabase storage paths
ALTER TABLE "ProductImage" 
  RENAME COLUMN "url" TO "storage_path";

-- Add a computed column for the public URL
ALTER TABLE "ProductImage"
  ADD COLUMN "public_url" TEXT GENERATED ALWAYS AS (
    'https://jegaqqjdtmspoxlrwwaz.supabase.co/storage/v1/object/public/product-images/' || storage_path
  ) STORED;

-- Update the function to handle Supabase storage paths
CREATE OR REPLACE FUNCTION delete_product_images(
  product_id_param INTEGER
) RETURNS VOID AS $$
DECLARE
  image_record RECORD;
BEGIN
  -- Get all storage paths for the product
  FOR image_record IN 
    SELECT "storage_path" 
    FROM "ProductImage" 
    WHERE "productId" = product_id_param
  LOOP
    -- Delete from storage
    PERFORM supabase.storage.remove('product-images', image_record.storage_path);
  END LOOP;
  
  -- Delete the database records
  DELETE FROM "ProductImage" WHERE "productId" = product_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
