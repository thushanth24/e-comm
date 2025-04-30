import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { imageUploadSchema } from '@/lib/validations';
import { generateImageKey, generateUploadUrl } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validatedData = imageUploadSchema.parse(body);
    const { filename, contentType } = validatedData;
    
    // Generate a unique key for the S3 object
    const key = generateImageKey(filename);
    
    // Generate a presigned URL for upload
    const presignedData = await generateUploadUrl(key, contentType);
    
    return NextResponse.json(presignedData);
  } catch (error) {
    console.error('Error generating upload URL:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
