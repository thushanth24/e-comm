-- Try to enable RLS on storage.objects if we have permission
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'storage' 
    AND table_name = 'objects'
  ) THEN
    EXECUTE 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not enable RLS on storage.objects: %', SQLERRM;
END $$;

-- Create a policy that allows full access to service role
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Allow full access to service role'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow full access to service role" ON storage.objects
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true)';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not create service role policy: %', SQLERRM;
END $$;

-- Allow public read access to all files in the product-images bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public read access for product-images'
  ) THEN
    EXECUTE 'CREATE POLICY "Public read access for product-images" ON storage.objects
      FOR SELECT
      USING (bucket_id = ''product-images'')';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not create public read policy: %', SQLERRM;
END $$;

-- Allow insert/update/delete only for authenticated users with service role
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated insert access'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated insert access" ON storage.objects
      FOR INSERT
      TO service_role
      WITH CHECK (true)';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not create insert policy: %', SQLERRM;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated update access'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated update access" ON storage.objects
      FOR UPDATE
      TO service_role
      USING (true)';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not create update policy: %', SQLERRM;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated delete access'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated delete access" ON storage.objects
      FOR DELETE
      TO service_role
      USING (true)';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not create delete policy: %', SQLERRM;
END $$;
