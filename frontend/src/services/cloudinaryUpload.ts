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

export type CloudinaryUploadOptions = { folder?: string };

export async function uploadImageToCloudinary(
  uri: string,
  fileName = 'avatar.jpg',
  onProgress?: UploadProgressCallback,
  options?: CloudinaryUploadOptions
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

  const folder = options?.folder ?? CLOUDINARY_FOLDER;

  const formData = new FormData();
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);
  formData.append('file', {
    uri,
    name: fileName,
    type: 'image/jpeg',
  } as unknown as Blob);

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    let message = `Upload failed (${response.status}).`;
    try {
      const json = JSON.parse(text);
      const errMsg = json?.error?.message ?? json?.message ?? text;
      if (typeof errMsg === 'string' && (errMsg.toLowerCase().includes('whitelisted') || errMsg.includes('unsigned'))) {
        message = 'Cloudinary preset must allow unsigned uploads. In Cloudinary: Settings → Upload → your preset → set Signing mode to "Unsigned".';
      } else {
        message = errMsg;
      }
    } catch {
      message = text || message;
    }
    throw new Error(message);
  }

  const result: CloudinaryUploadResult = await response.json();
  if (result.secure_url) {
    return result.secure_url;
  }
  throw new Error('Invalid response from Cloudinary');
}
