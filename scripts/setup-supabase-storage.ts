import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupStorage() {
  try {
    console.log('🔄 Setting up Supabase storage...');

    // Create the bucket if it doesn't exist
    const { data: bucketData, error: bucketError } = await supabase.storage
      .createBucket('product-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 1024 * 1024 * 5, // 5MB
      });

    if (bucketError) {
      if (bucketError.message.includes('Bucket already exists')) {
        console.log('ℹ️ Bucket already exists');
      } else {
        throw bucketError;
      }
    } else {
      console.log('✅ Created bucket:', bucketData);
    }

    // Set bucket policies
    const { error: policyError } = await supabase.rpc('create_storage_policy', {
      bucket_name: 'product-images',
      policy_name: 'Public read access',
      policy_definition: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: 's3:GetObject',
            Resource: `arn:aws:s3:::product-images/*`,
          },
        ],
      },
    });

    if (policyError) {
      console.error('❌ Error setting bucket policy:', policyError);
    } else {
      console.log('✅ Set bucket policy');
    }

    console.log('✨ Storage setup complete!');
  } catch (error) {
    console.error('❌ Error setting up storage:', error);
    process.exit(1);
  }
}

setupStorage();
