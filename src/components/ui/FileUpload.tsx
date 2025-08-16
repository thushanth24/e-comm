'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { uploadFile } from '@/lib/supabase';

// Simple progress bar component
const Progress = ({ value, className }: { value: number; className?: string }) => (
  <div className={cn('w-full bg-muted rounded-full h-2.5', className)}>
    <div 
      className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out"
      style={{ width: `${value}%` }}
    />
  </div>
);

// Simple toast hook
const useToast = () => {
  return {
    toast: (options: { title: string; description?: string; variant?: string }) => {
      console[options.variant === 'destructive' ? 'error' : 'log'](
        options.title,
        options.description || ''
      );
    },
  };
};

interface FileUploadProps {
  value?: string;
  onChange: (url?: string) => void;
  className?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
  disabled?: boolean;
  bucket?: string;
  path?: string;
}

export const FileUpload = ({
  value,
  onChange,
  className,
  maxSizeMB = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  disabled = false,
  bucket = 'product-images',
  path = 'uploads',
}: FileUploadProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [fileType, setFileType] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file) return;

      try {
        setIsLoading(true);
        setProgress(0);

        // Set up progress tracking
        const progressInterval = setInterval(() => {
          setProgress((prev) => (prev >= 90 ? prev : prev + 10));
        }, 200);

        // Upload the file
        const result = await uploadFile(file, {
          bucket,
          path: `${path}/${Date.now()}-${file.name}`,
        });

        clearInterval(progressInterval);
        setProgress(100);

        // Update the parent component with the file URL
        onChange(result.url);

        toast({
          title: 'Success',
          description: 'File uploaded successfully',
          variant: 'default',
        });

        return result.url;
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: 'Error',
          description: 'Failed to upload file',
          variant: 'destructive',
        });
        throw error;
      } finally {
        setIsLoading(false);
        setTimeout(() => setProgress(0), 1000);
      }
    },
    [bucket, onChange, path, toast]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      
      const file = acceptedFiles[0];
      setFileType(file.type);
      const reader = new FileReader();
      
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      
      reader.readAsDataURL(file);
      handleUpload(file).catch(console.error);
    },
    [handleUpload]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileType(file.type);
    const reader = new FileReader();
    
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    
    reader.readAsDataURL(file);
    handleUpload(file).catch(console.error);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': allowedTypes.map((type) => type.replace('image/', '')),
    },
    maxSize: maxSizeMB * 1024 * 1024,
    disabled: isLoading || disabled,
    multiple: false,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isImage = preview?.match(/\.(jpeg|jpg|gif|png|webp)$/) !== null;

  return (
    <div className={cn('w-full', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg transition-colors',
          isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:bg-muted/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Uploading... {progress}%</p>
            <Progress value={progress} className="w-full mt-2" />
          </div>
        ) : preview ? (
          <div className="relative w-full">
            {isImage ? (
              <div className="relative aspect-video rounded-md overflow-hidden">
                <img
                  src={preview}
                  alt="Preview"
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="flex items-center p-4 rounded-lg bg-muted">
                <Upload className="w-8 h-8 text-muted-foreground mr-3" />
                <div className="truncate">
                  <p className="text-sm font-medium truncate">
                    {value?.split('/').pop()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {fileType ? fileType.split('/').pop()?.toUpperCase() : 'FILE'} file
                  </p>
                </div>
              </div>
            )}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 rounded-full w-6 h-6"
              onClick={handleRemove}
              disabled={isLoading || disabled}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="p-3 rounded-full bg-muted">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {isDragActive ? 'Drop the file here' : 'Drag & drop a file here or click to select'}
              </p>
              <p className="text-xs text-muted-foreground">
                {`${allowedTypes.join(', ')} (max ${maxSizeMB}MB)`}
              </p>
            </div>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={allowedTypes.join(',')}
        className="hidden"
        disabled={isLoading || disabled}
      />
    </div>
  );
};

export default FileUpload;
