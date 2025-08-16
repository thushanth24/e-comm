-- Create function to enable RLS on storage.objects
CREATE OR REPLACE FUNCTION enable_rls_on_storage_objects()
RETURNS void AS $$
BEGIN
  EXECUTE format('ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY');
  EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'RLS already enabled on storage.objects: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to apply storage policies
CREATE OR REPLACE FUNCTION apply_storage_policies()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Public read access for product-images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated insert access" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated update access" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated delete access" ON storage.objects;
  DROP POLICY IF EXISTS "Allow full access to service role" ON storage.objects;

  -- Create a policy that allows full access to service role
  EXECUTE format('CREATE POLICY "Allow full access to service role" ON storage.objects
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true)');

  -- Allow public read access to all files in the product-images bucket
  EXECUTE format('CREATE POLICY "Public read access for product-images" ON storage.objects
    FOR SELECT
    USING (bucket_id = ''product-images'')');

  -- Allow insert/update/delete only for authenticated users with service role
  EXECUTE format('CREATE POLICY "Authenticated insert access" ON storage.objects
    FOR INSERT
    TO service_role
    WITH CHECK (true)');

  EXECUTE format('CREATE POLICY "Authenticated update access" ON storage.objects
    FOR UPDATE
    TO service_role
    USING (true)');

  EXECUTE format('CREATE POLICY "Authenticated delete access" ON storage.objects
    FOR DELETE
    TO service_role
    USING (true)');

  RETURN json_build_object('status', 'success', 'message', 'Storage policies applied successfully');
  
  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('status', 'error', 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
