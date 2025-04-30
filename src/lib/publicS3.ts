// src/lib/publicS3.ts

const bucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME;
const region = process.env.NEXT_PUBLIC_AWS_REGION;

if (!bucketName || !region) {
  throw new Error('Missing S3 environment variables');
}

export function getPublicUrl(key: string): string {
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}
