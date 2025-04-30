import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

// Setup
const region = process.env.AWS_REGION || 'ap-south-1';
const bucketName = process.env.AWS_S3_BUCKET_NAME;

if (!bucketName) {
  throw new Error('Missing AWS_S3_BUCKET_NAME environment variable');
}

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// ✅ Generate a signed URL for uploading an image to S3
export async function generateUploadUrl(key: string, contentType: string) {
  try {
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: bucketName!, // assertion safe after earlier check
      Key: key,
      Conditions: [
        ['content-length-range', 0, 10485760], // Max 10MB
        ['starts-with', '$Content-Type', ''],
        ['eq', '$acl', 'public-read']
      ],
      Fields: {
        'Content-Type': contentType,
        acl: 'public-read'
      },
      Expires: 600, // 10 minutes
    });

    return { url, fields };
  } catch (error) {
    console.error('Error generating S3 presigned URL:', error);
    throw new Error('Failed to generate upload URL');
  }
}

// ✅ Generate a unique image key
export function generateImageKey(filename: string): string {
  const extension = filename.split('.').pop();
  const randomId = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now();
  return `products/${timestamp}-${randomId}.${extension}`;
}

// ✅ Construct public URL for the uploaded image
export function getPublicUrl(key: string): string {
  const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
  console.log('Test public image URL:', publicUrl);
  return publicUrl; // <-- ✅ FIXED: ensure the value is returned
}
