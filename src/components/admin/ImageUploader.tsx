'use client';

import { useState } from 'react';
import Image from 'next/image';
import { imageUploadSchema } from '@/lib/validations';
import Button from '@/components/ui/Button';
import { getPublicUrl } from '@/lib/publicS3'; // Make sure this is correctly configured

interface ImageUploaderProps {
  existingImages: string[];
  onImagesChange: (urls: string[]) => void;
}

export default function ImageUploader({ existingImages = [], onImagesChange }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>(existingImages);

  const uploadImage = async (file: File) => {
    try {
      console.log('📤 Starting upload for file:', file);

      setIsUploading(true);
      setUploadError(null);

      const validationResult = imageUploadSchema.safeParse({
        filename: file.name,
        contentType: file.type,
      });

      if (!validationResult.success) {
        console.error('❌ Validation failed:', validationResult.error.errors);
        throw new Error(validationResult.error.errors[0]?.message || 'Invalid file');
      }

      console.log('✅ Validation passed:', file.name);

      const response = await fetch('/api/s3/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      });

      console.log('📡 Requesting presigned URL...');
      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Failed to get upload URL:', error);
        throw new Error(error.message || 'Failed to get upload URL');
      }

      const { url, fields } = await response.json();
      console.log('✅ Received presigned URL:', { url, fields });

      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('file', file);

      console.log('📦 Uploading file to S3...');
      const uploadResponse = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const text = await uploadResponse.text();
        console.error('❌ S3 upload failed:', text);
        throw new Error('Failed to upload image to S3');
      }

      console.log('✅ Upload successful. Constructing public URL...');
      const imageUrl = getPublicUrl(fields.key);
      console.log('🌐 Public image URL:', imageUrl);

      const newImages = [...images, imageUrl];
      setImages(newImages);
      onImagesChange(newImages);
    } catch (error) {
      console.error('🛑 Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    await uploadImage(files[0]);
    e.target.value = '';
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    setImages(newImages);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => document.getElementById('file-upload')?.click()}
          isLoading={isUploading}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </Button>
        <input
          id="file-upload"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>

      {uploadError && (
        <p className="text-red-500 text-sm">{uploadError}</p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-2">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border flex items-center justify-center" style={{ width: 120, height: 120 }}>
              <Image
                src={imageUrl}
                alt={`Product image ${index + 1}`}
                width={120}
                height={120}
                className="object-cover rounded"
                style={{ maxWidth: 120, maxHeight: 120 }}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
