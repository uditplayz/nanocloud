import { tokenService } from './tokenService';

const API_URL = import.meta.env.VITE_API_URL;

export const fileService = {
  // Get all files for logged-in user
  async getFiles() {
    const response = await fetch(`${API_URL}/api/files`, {
      method: 'GET',
      headers: {
        'x-auth-token': tokenService.getToken() || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch files');
    }

    const backendFiles = await response.json();
    
    // Transform backend format to frontend format
    return backendFiles.map((file: any) => ({
      id: file._id,
      name: file.originalFilename,
      type: file.mimetype,
      size: file.fileSize,
      lastModified: new Date(file.uploadDate || file.createdAt),
      owner: file.owner,
      s3Key: file.s3Key,
      sharingInfo: {
        isPublic: file.isPublic || false,
        publicLink: file.shareToken ? `${window.location.origin}/share/${file.shareToken}` : '',
        collaborators: file.collaborators || [],
      },
    }));
  },

  // Delete a file
  async deleteFile(fileId: string) {
    const response = await fetch(`${API_URL}/api/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': tokenService.getToken() || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }

    return response.json();
  },
};
