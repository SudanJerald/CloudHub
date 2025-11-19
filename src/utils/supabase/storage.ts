import { projectId, publicAnonKey } from './info';

const SUPABASE_URL = `https://${projectId}.supabase.co`;
const STORAGE_BUCKET = 'certificates'; // You'll need to create this bucket in Supabase

interface UploadResponse {
  url: string;
  path: string;
}

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param userEmail - User's email for organizing files
 * @returns Object containing the public URL and file path
 */
export async function uploadCertificate(file: File, userEmail: string): Promise<UploadResponse> {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const sanitizedEmail = userEmail.replace(/[@.]/g, '_');
    const fileExt = file.name.split('.').pop();
    const fileName = `${sanitizedEmail}/${timestamp}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);

    // Upload to Supabase Storage
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${fileName}`;
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    // Get public URL
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;

    return {
      url: publicUrl,
      path: fileName
    };
  } catch (error) {
    console.error('Error uploading to Supabase Storage:', error);
    throw error;
  }
}

/**
 * Delete a file from Supabase Storage
 * @param filePath - The path of the file to delete
 */
export async function deleteCertificate(filePath: string): Promise<void> {
  try {
    const deleteUrl = `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${filePath}`;
    
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      }
    });

    if (!response.ok && response.status !== 404) {
      const error = await response.json();
      throw new Error(error.message || 'Delete failed');
    }
  } catch (error) {
    console.error('Error deleting from Supabase Storage:', error);
    throw error;
  }
}

/**
 * Get public URL for a file
 * @param filePath - The path of the file
 * @returns Public URL
 */
export function getCertificateUrl(filePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${filePath}`;
}
