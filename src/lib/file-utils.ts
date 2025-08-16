/**
 * Format bytes as human-readable text.
 * 
 * @param bytes Number of bytes.
 * @param decimals Number of decimal places.
 * @returns Formatted string.
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Get the file extension from a filename or path.
 * 
 * @param filename The filename or path.
 * @returns The file extension in lowercase, or an empty string if not found.
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Check if a file is an image based on its MIME type.
 * 
 * @param file The file to check.
 * @returns True if the file is an image, false otherwise.
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Create a data URL from a file for preview purposes.
 * 
 * @param file The file to create a preview for.
 * @returns A promise that resolves with the data URL.
 */
export function createPreviewUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Check if a file type is allowed.
 * 
 * @param file The file to check.
 * @param allowedTypes Array of allowed MIME types.
 * @returns True if the file type is allowed, false otherwise.
 */
export function isFileTypeAllowed(
  file: File, 
  allowedTypes: string[]
): boolean {
  if (!allowedTypes.length) return true;
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      // Handle wildcard types like 'image/*'
      return file.type.startsWith(type.replace('/*', '/'));
    }
    return file.type === type;
  });
}

/**
 * Get the appropriate icon for a file type.
 * 
 * @param file The file or file type.
 * @returns The name of the icon to use.
 */
export function getFileIcon(file: File | string): string {
  const type = typeof file === 'string' ? file : file.type;
  
  if (type.startsWith('image/')) return 'image';
  if (type === 'application/pdf') return 'file-text';
  if (
    type === 'application/msword' ||
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) return 'file-text';
  if (
    type === 'application/vnd.ms-excel' ||
    type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) return 'file-spreadsheet';
  if (
    type === 'application/vnd.ms-powerpoint' ||
    type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ) return 'file-presentation';
  if (type.startsWith('text/')) return 'file-text';
  if (type.startsWith('audio/')) return 'file-audio';
  if (type.startsWith('video/')) return 'file-video';
  if (type === 'application/zip' || type === 'application/x-zip-compressed') return 'file-archive';
  
  return 'file';
}

/**
 * Generate a unique filename with a timestamp and random string.
 * 
 * @param originalName The original filename.
 * @returns A unique filename.
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = getFileExtension(originalName);
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  
  return `${nameWithoutExt}-${timestamp}-${randomString}${extension ? `.${extension}` : ''}`;
}
