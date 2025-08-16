import { supabase } from './supabase';

export const STORAGE_BUCKET = 'product-images';

interface UploadOptions {
  path?: string;
  upsert?: boolean;
}

export const uploadFile = async (file: File, options: UploadOptions = {}) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = options.path ? `${options.path}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: options.upsert || false,
      });

    if (error) throw error;

    return {
      path: data.path,
      publicUrl: getPublicUrl(data.path)
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const deleteFile = async (path: string) => {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([path]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

export const getPublicUrl = (path: string) => {
  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path);
  
  return data.publicUrl;
};

export const downloadFile = async (path: string) => {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(path);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};
