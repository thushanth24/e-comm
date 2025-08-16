import { SupabaseClient } from '@supabase/supabase-js';

declare global {
  // Extend the Window interface if you need to access the Supabase client from the window object
  interface Window {
    supabase?: SupabaseClient;
  }

  // Type definitions for Supabase Storage
  namespace SupabaseStorage {
    interface FileObject {
      id: string;
      name: string;
      updated_at: string;
      created_at: string;
      last_accessed_at: string;
      metadata: Record<string, any>;
      path_tokens: string[];
      bucket_id: string;
    }

    interface FileOptions {
      cacheControl?: string;
      contentType?: string;
      upsert?: boolean;
    }

    interface StorageError extends Error {
      statusCode?: string;
      error?: string;
      message: string;
    }
  }
}

// This ensures the file is treated as a module
export {};
