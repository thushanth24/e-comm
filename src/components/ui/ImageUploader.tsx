'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface ImageUploaderProps {
  value?: string;
  onChange: (url?: string) => void;
  className?: string;
  disabled?: boolean;
  bucket?: string;
  path?: string;
}

export function ImageUploader({
  value,
  onChange,
  className,
  disabled = false,
  bucket = 'product-images',
  path = 'uploads',
}: ImageUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      
      const file = acceptedFiles[0];
      if (!file) return;

      try {
        setIsLoading(true);
        
        // In a real implementation, you would upload the file here
        // For now, we'll just create a local URL for the image
        const objectUrl = URL.createObjectURL(file);
        onChange(objectUrl);
        
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: isLoading || disabled,
    multiple: false,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg transition-colors',
          isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:bg-muted/50',
          disabled && 'opacity-50 cursor-not-allowed',
          'cursor-pointer min-h-[200px]'
        )}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : value ? (
          <div className="relative w-full h-full">
            <div className="relative w-full h-full rounded-md overflow-hidden">
              <img
                src={value}
                alt="Preview"
                className="object-cover w-full h-full max-h-[300px]"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0 bg-background border"
              onClick={handleRemove}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                <span className="text-primary hover:underline">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
