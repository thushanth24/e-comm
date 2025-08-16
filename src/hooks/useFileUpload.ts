import { useState, useCallback } from 'react';
import { clientUploadFile, UploadResponse } from '@/lib/storage-utils';

type UseFileUploadOptions = {
  onSuccess?: (result: UploadResponse) => void;
  onError?: (error: Error) => void;
  maxSizeMB?: number;
  allowedTypes?: string[];
};

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const {
    onSuccess,
    onError,
    maxSizeMB = 5,
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<UploadResponse | null>(null);

  const validateFile = useCallback(
    (file: File): { isValid: boolean; error?: string } => {
      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        return {
          isValid: false,
          error: `File size must be less than ${maxSizeMB}MB`,
        };
      }

      // Check file type
      if (!allowedTypes.includes(file.type)) {
        return {
          isValid: false,
          error: `Only ${allowedTypes.join(', ')} files are allowed`,
        };
      }

      return { isValid: true };
    },
    [maxSizeMB, allowedTypes]
  );

  const upload = useCallback(
    async (
      file: File,
      uploadOptions: {
        bucket?: string;
        path?: string;
        upsert?: boolean;
      } = {}
    ): Promise<UploadResponse> => {
      setIsUploading(true);
      setProgress(0);
      setError(null);
      setResult(null);

      try {
        // Validate file
        const { isValid, error: validationError } = validateFile(file);
        if (!isValid && validationError) {
          throw new Error(validationError);
        }

        // Simulate progress (actual progress would come from XMLHttpRequest or fetch)
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            const next = prev + Math.random() * 20;
            return next > 90 ? 90 : next;
          });
        }, 200);

        // Upload the file
        const result = await clientUploadFile(file, {
          bucket: uploadOptions.bucket,
          path: uploadOptions.path,
          upsert: uploadOptions.upsert,
        });

        clearInterval(progressInterval);
        setProgress(100);

        if (result.error) {
          throw result.error;
        }

        setResult(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Upload failed');
        setError(error);
        onError?.(error);
        return {
          path: '',
          url: '',
          error,
        };
      } finally {
        setIsUploading(false);
      }
    },
    [onError, onSuccess, validateFile]
  );

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
    setResult(null);
  }, []);

  return {
    upload,
    isUploading,
    progress,
    error,
    result,
    reset,
  };
};

export default useFileUpload;
