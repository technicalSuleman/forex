// Cloudinary config - replace with your values from https://cloudinary.com/console
// 1. Get Cloud name from dashboard
// 2. Settings → Upload → Add Upload Preset → set Signing mode: Unsigned
export const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your_cloud_name';
export const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'your_unsigned_preset';
export const CLOUDINARY_FOLDER = 'avatars';
