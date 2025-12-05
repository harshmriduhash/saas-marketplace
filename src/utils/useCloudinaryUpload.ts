import { useCallback, useState } from 'react';

export const useCloudinaryUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      // Get upload signature from server
      const sigRes = await fetch('/api/cloudinary/signature', { method: 'POST' });
      if (!sigRes.ok) throw new Error('Could not get upload signature');

      const { timestamp, signature, cloudName } = await sigRes.json();

      // Prepare FormData for Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '');
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('upload_preset', 'unsigned_preset'); // Use unsigned preset

      // Upload directly to Cloudinary
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!uploadRes.ok) throw new Error('Upload failed');

      const uploadData = await uploadRes.json();
      const url = uploadData.secure_url;

      setUploadedUrl(url);
      setUploading(false);
      return url;
    } catch (err) {
      console.error('Image upload error:', err);
      setUploading(false);
      return null;
    }
  }, []);

  return { uploadImage, uploading, uploadedUrl };
};
