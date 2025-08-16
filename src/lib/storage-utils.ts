import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

type FileUploadOptions = {
  bucket?: string;
  path?: string;
  upsert?: boolean;
  contentType?: string;
  cacheControl?: string;
};

type UploadResponse = {
  path: string;
  url: string;
  error?: Error;
};

/**
 * Server-side function to upload a file using the service role key
 * This should only be used in API routes or server components
 */
export const serverUploadFile = async (
  file: File | Buffer,
  options: FileUploadOptions = {}
): Promise<UploadResponse> => {
  const {
    bucket = 'product-images',
    path = `${Date.now()}-${file instanceof File ? file.name : 'file'}`,
    upsert = false,
    contentType = file instanceof File ? file.type : 'application/octet-stream',
    cacheControl = '3600',
  } = options;

  try {
    // Initialize admin client with service role key
    const admin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Convert File to ArrayBuffer if needed
    const fileData = file instanceof File ? await file.arrayBuffer() : file;

    // Upload the file
    const { data, error } = await admin.storage
      .from(bucket)
      .upload(path, fileData, {
        cacheControl,
        upsert,
        contentType,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return { path: '', url: '', error };
    }

    // Get public URL
    const { data: { publicUrl } } = admin.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      url: publicUrl,
    };
  } catch (error) {
    console.error('Error in serverUploadFile:', error);
    return {
      path: '',
      url: '',
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

/**
 * Client-side function to upload a file through an API route
 * This is the recommended way to handle uploads from the browser
 */
export const clientUploadFile = async (
  file: File,
  options: Omit<FileUploadOptions, 'contentType'> = {}
): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add options to form data
    if (options.bucket) formData.append('bucket', options.bucket);
    if (options.path) formData.append('path', options.path);
    if (options.upsert) formData.append('upsert', 'true');
    if (options.cacheControl) formData.append('cacheControl', options.cacheControl);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in clientUploadFile:', error);
    return {
      path: '',
      url: '',
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

/**
 * Delete a file from storage
 */
export const deleteFile = async (
  path: string,
  bucket = 'product-images'
): Promise<{ success: boolean; error?: Error }> => {
  try {
    // Use the admin client for deletion
    const admin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { error } = await admin.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Storage delete error:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteFile:', error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

/**
 * Generate a signed URL for secure file access
 */
export const getSignedUrl = async (
  path: string,
  expiresIn = 3600, // 1 hour
  bucket = 'product-images'
): Promise<{ signedUrl: string | null; error: Error | null }> => {
  try {
    const admin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data, error } = await admin.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Error creating signed URL:', error);
      return { signedUrl: null, error };
    }

    return { signedUrl: data.signedUrl, error: null };
  } catch (error) {
    console.error('Error in getSignedUrl:', error);
    return {
      signedUrl: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};
