/**
 * Upload image to Firebase Storage and return download URL.
 * Used for News post images. Supports progress callback.
 *
 * Firebase Console → Storage → Rules: allow write to "news" folder, e.g.:
 *   match /news/{fileName} { allow read, write: if request.auth != null; }
 *   or for testing: allow read, write;
 */
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  UploadTaskSnapshot,
} from 'firebase/storage';
import { storage } from '../firebaseConfig';

export type UploadProgressCallback = (percent: number) => void;

/**
 * Fetch local file as Blob (works with file:// URIs in React Native).
 */
async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  if (!response.ok) throw new Error('Failed to read image file');
  return response.blob();
}

/**
 * Upload image from local URI to Firebase Storage path news/{fileName}.
 * Returns the download URL. Optional onProgress(0-100).
 */
export async function uploadNewsImage(
  localUri: string,
  onProgress?: UploadProgressCallback
): Promise<string> {
  const blob = await uriToBlob(localUri);
  const fileName = `news/${Date.now()}_${Math.random().toString(36).slice(2, 10)}.jpg`;
  const storageRef = ref(storage, fileName);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, blob, {
      contentType: 'image/jpeg',
    });

    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        if (snapshot.totalBytes > 0 && onProgress) {
          const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(percent);
        }
      },
      (err) => {
        reject(err?.message ? new Error(err.message) : new Error('Upload failed'));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          if (onProgress) onProgress(100);
          resolve(downloadURL);
        } catch (e) {
          reject(e instanceof Error ? e : new Error('Failed to get download URL'));
        }
      }
    );
  });
}
