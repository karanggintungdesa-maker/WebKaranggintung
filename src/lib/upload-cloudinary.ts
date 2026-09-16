/**
 * Client-side Cloudinary upload using the unsigned upload API.
 *
 * Requires an "unsigned upload preset" configured in your Cloudinary dashboard:
 * Settings → Upload → Upload presets → Add upload preset → Signing mode: Unsigned
 *
 * Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
 * in your .env.local file.
 *
 * NOTE: Unsigned upload is safe for public assets (photos for village website).
 * Folder-level restrictions can be set in the upload preset settings.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || 'dxta8rrlz';
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'webdesa_unsigned';

export async function uploadToCloudinary(
  file: File | Blob,
  folder: string = 'webdesa'
): Promise<string> {
  if (!CLOUD_NAME) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME tidak diset di .env.local');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data?.error?.message || 'Gagal mengunggah foto ke Cloudinary.'
    );
  }

  return data.secure_url as string;
}
