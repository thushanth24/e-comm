import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function setupStorage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase URL or Service Role Key in environment variables');
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const BUCKET_NAME = 'product-images';

  try {
    console.log('🔄 Setting up storage bucket...');

    // Create the bucket
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
      fileSizeLimit: 1024 * 1024 * 5, // 5MB
    });

    if (bucketError) {
      if (bucketError.message.includes('Bucket already exists')) {
        console.log('ℹ️ Bucket already exists');
      } else {
        throw bucketError;
      }
    } else {
      console.log('✅ Created bucket:', bucket);
    }

    // Set bucket to public by updating the bucket policy
    const { error: policyError } = await supabase
      .storage
      .updateBucket(BUCKET_NAME, {
        public: true
      });

    if (policyError) {
      console.error('❌ Error updating bucket policy:', policyError);
      throw policyError;
    }

    console.log('✅ Bucket is now public');
    console.log('✨ Storage setup complete!');
  } catch (error) {
    console.error('❌ Error setting up storage:', error);
    process.exit(1);
  }
}

setupStorage();
