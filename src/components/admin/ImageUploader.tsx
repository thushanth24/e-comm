'use client';

import { useState, ChangeEvent } from 'react';
import Image from 'next/image';
import { imageUploadSchema } from '@/lib/validations';
import Button from '@/components/ui/Button';
import { uploadFile, deleteFile, STORAGE_BUCKET } from '@/lib/storage';

const STORAGE_URL = `https://jegaqqjdtmspoxlrwwaz.supabase.co/storage/v1/object/public/${STORAGE_BUCKET}`;

interface ImageUploaderProps {
  existingImages: string[];
  onImagesChange: (urls: string[]) => void;
}

export default function ImageUploader({ existingImages = [], onImagesChange }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Ensure existing images have the full URL
  const [images, setImages] = useState<string[]>(() => {
    return existingImages.map(img => {
      // If it's already a full URL, use it as is
      if (img.startsWith('http')) return img;
      // If it's a path, construct the full URL
      if (img.startsWith('/')) return `${STORAGE_URL}${img}`;
      // Otherwise, assume it's a path without leading slash
      return `${STORAGE_URL}/${img}`;
    });
  });

  const uploadImage = async (file: File) => {
    try {
      console.log('📤 Starting upload for file:', file);
      setIsUploading(true);
      setUploadError(null);

      // Validate file
      const validationResult = imageUploadSchema.safeParse({
        filename: file.name,
        contentType: file.type,
      });

      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0]?.message || 'Invalid file');
      }

      // Upload file using our storage utility
      const { path, publicUrl } = await uploadFile(file);
      console.log('✅ Upload successful:', publicUrl);
      
      // Update state with the new image URL
      const newImages = [...images, publicUrl];
      setImages(newImages);
      // Pass the full URL to the parent component for validation
      onImagesChange([...existingImages, publicUrl]);
    } catch (error) {
      handleError(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Convert FileList to array and upload each file
    // Limit to 10 images max
    const filesToUpload = Array.from(files).slice(0, 10 - images.length);
    
    if (filesToUpload.length < files.length) {
      setUploadError('Maximum 10 images allowed. Only the first ' + filesToUpload.length + ' will be uploaded.');
    }
    
    filesToUpload.forEach((file) => {
      uploadImage(file).catch(handleError);
    });
    
    // Reset the input value to allow re-uploading the same file
    e.target.value = '';
  };

  const removeImage = async (index: number) => {
    try {
      const imageToRemove = images[index];
      // Extract just the path part for deletion
      const pathToRemove = imageToRemove.replace(`${STORAGE_URL}/`, '');
      
      // Remove from storage using our utility
      await deleteFile(pathToRemove);
      
      // Update UI and parent component
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
      onImagesChange(existingImages.filter((_, i) => i !== index));
      
    } catch (error) {
      console.error('Error removing image:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to remove image');
    }
  };

  // Add proper type for the error
  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      setUploadError(error.message);
    } else {
      setUploadError('An unknown error occurred');
    }
    console.error('Error:', error);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
          Upload Images
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        {isUploading && (
          <div className="flex items-center text-gray-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
            Uploading...
          </div>
        )}
      </div>
      
      {uploadError && (
        <div className="text-red-600 text-sm mt-2">
          {uploadError}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
          {images.map((url, index) => (
            <div key={url} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={url}
                  alt={`Product image ${index + 1}`}
                  width={120}
                  height={120}
                  className="object-cover rounded"
                  style={{ maxWidth: 120, maxHeight: 120 }}
                />
              </div>
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
