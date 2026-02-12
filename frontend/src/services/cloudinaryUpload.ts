import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_FOLDER,
} from '../config/cloudinary';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}

export type UploadProgressCallback = (percent: number) => void;

export async function uploadImageToCloudinary(
  uri: string,
  fileName = 'avatar.jpg',
  onProgress?: UploadProgressCallback
): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
    throw new Error(
      'Cloudinary not configured. Set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env'
    );
  }
  if (!CLOUDINARY_UPLOAD_PRESET || CLOUDINARY_UPLOAD_PRESET === 'your_unsigned_preset') {
    throw new Error(
      'Cloudinary upload preset not configured. Create an unsigned preset in Cloudinary dashboard.'
    );
  }

  const formData = new FormData();
  formData.append('file', {
    uri,
    type: 'image/jpeg',
    name: fileName,
  } as unknown as Blob);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', CLOUDINARY_FOLDER);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result: CloudinaryUploadResult = JSON.parse(xhr.responseText);
          resolve(result.secure_url);
        } catch {
          reject(new Error('Invalid response from Cloudinary'));
        }
      } else {
        reject(new Error(`Cloudinary upload failed: ${xhr.responseText || xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
    xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

    xhr.open('POST', url);
    xhr.send(formData);
  });
}
