import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export interface ProcessedImage {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
}

/**
 * Resizes and compresses an image file or data URL using HTML5 Canvas.
 * Ensures fast upload, reduced bandwidth, and safe fallback to Firestore.
 */
export const compressImage = async (
  source: File | Blob | string,
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 0.85
): Promise<ProcessedImage> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const handleLoad = () => {
      let width = img.width;
      let height = img.height;

      // Calculate proportional aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to create canvas context'));
        return;
      }

      // Draw high-quality image
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Export as JPEG
      const dataUrl = canvas.toDataURL('image/jpeg', quality);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to generate image blob'));
            return;
          }
          resolve({
            blob,
            dataUrl,
            width,
            height,
            sizeBytes: blob.size,
          });
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = (err) => {
      reject(new Error('Failed to load image for processing: ' + String(err)));
    };

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(source);
    }
  });
};

/**
 * Uploads an image blob to Firebase Storage.
 * If Firebase Storage is restricted, offline, or unavailable,
 * gracefully falls back to the compressed Data URL so saving is 100% resilient.
 */
export const uploadImageToStorage = async (
  fileOrBlob: Blob | File,
  fallbackDataUrl?: string,
  folder = 'uploads'
): Promise<string> => {
  try {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const extension = fileOrBlob.type.includes('png') ? 'png' : 'jpg';
    const filePath = `${folder}/${timestamp}_${randomSuffix}.${extension}`;

    const storageRef = ref(storage, filePath);
    const snapshot = await uploadBytes(storageRef, fileOrBlob, {
      contentType: fileOrBlob.type || 'image/jpeg',
    });

    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.warn('Storage upload encountered an issue, using optimized inline image payload:', error);
    // If upload fails (e.g. security rules or quota), fallback safely to data URL
    if (fallbackDataUrl) {
      return fallbackDataUrl;
    }
    // Otherwise convert blob to dataUrl
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(fileOrBlob);
    });
  }
};

