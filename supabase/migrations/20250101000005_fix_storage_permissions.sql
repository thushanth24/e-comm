-- Enable RLS on storage.objects if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'storage' 
    AND table_name = 'objects'
  ) THEN
    -- Create the storage.objects table if it doesn't exist
    CREATE TABLE storage.objects (
      id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
      bucket_id text NOT NULL,
      name text,
      owner uuid REFERENCES auth.users(id),
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      last_accessed_at timestamptz DEFAULT now(),
      metadata jsonb,
      path_tokens text[],
      version text
    );
    
    -- Enable ROW LEVEL SECURITY
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error setting up storage.objects: %', SQLERRM;
END $$;

-- Create policies for storage.objects
DO $$
BEGIN
  -- Allow public read access to files in the product-images bucket
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public read access for product-images'
  ) THEN
    EXECUTE 'CREATE POLICY "Public read access for product-images" 
      ON storage.objects 
      FOR SELECT 
      USING (bucket_id = ''product-images'');';
  END IF;

  -- Allow service role full access
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Full access for service role'
  ) THEN
    EXECUTE 'CREATE POLICY "Full access for service role" 
      ON storage.objects 
      FOR ALL 
      TO service_role 
      USING (true) 
      WITH CHECK (true);';
  END IF;
  
  -- Allow authenticated users to upload to their own folders
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload to their own folders'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can upload to their own folders" 
      ON storage.objects 
      FOR INSERT 
      TO authenticated 
      WITH CHECK (
        bucket_id = ''product-images'' AND 
        (storage.foldername(name))[1] = auth.uid()::text
      );';
  END IF;
  
  -- Allow users to manage their own files
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can manage their own files'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can manage their own files" 
      ON storage.objects 
      USING (auth.uid() = owner);';
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error creating storage policies: %', SQLERRM;
END $$;

-- Grant necessary permissions on storage schema
DO $$
BEGIN
  -- Only run if we have superuser privileges
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = CURRENT_USER AND rolsuper = true) THEN
    -- Grant all privileges on storage schema to service_role
    EXECUTE 'GRANT ALL ON SCHEMA storage TO service_role';
    EXECUTE 'GRANT ALL ON ALL TABLES IN SCHEMA storage TO service_role';
    EXECUTE 'GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO service_role';
    EXECUTE 'GRANT ALL ON ALL FUNCTIONS IN SCHEMA storage TO service_role';
    
    -- Set default privileges for future objects
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA storage GRANT ALL ON TABLES TO service_role';
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role';
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role';
    
    -- Grant usage on the schema to authenticated users
    EXECUTE 'GRANT USAGE ON SCHEMA storage TO authenticated';
    
    -- Make sure the service_role can access the auth schema
    EXECUTE 'GRANT USAGE ON SCHEMA auth TO service_role';
    EXECUTE 'GRANT SELECT ON ALL TABLES IN SCHEMA auth TO service_role';
  ELSE
    RAISE NOTICE 'Not running as superuser, skipping GRANT statements. Please run these manually with a superuser account:';
    RAISE NOTICE 'GRANT ALL ON SCHEMA storage TO service_role;';
    RAISE NOTICE 'GRANT ALL ON ALL TABLES IN SCHEMA storage TO service_role;';
    RAISE NOTICE 'GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO service_role;';
    RAISE NOTICE 'GRANT ALL ON ALL FUNCTIONS IN SCHEMA storage TO service_role;';
    RAISE NOTICE 'ALTER DEFAULT PRIVILEGES IN SCHEMA storage GRANT ALL ON TABLES TO service_role;';
    RAISE NOTICE 'ALTER DEFAULT PRIVILEGES IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;';
    RAISE NOTICE 'ALTER DEFAULT PRIVILEGES IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;';
    RAISE NOTICE 'GRANT USAGE ON SCHEMA storage TO authenticated;';
    RAISE NOTICE 'GRANT USAGE ON SCHEMA auth TO service_role;';
    RAISE NOTICE 'GRANT SELECT ON ALL TABLES IN SCHEMA auth TO service_role;';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error granting permissions: %', SQLERRM;
END $$;
