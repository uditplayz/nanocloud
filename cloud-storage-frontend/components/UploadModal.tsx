import React, { useState, useCallback } from 'react';
import { X, UploadCloud, File as FileIcon } from 'lucide-react';
import { FileItem, FileType, User } from '../types';
import { tokenService } from '../services/tokenService';

interface UploadModalProps {
  onClose: () => void;
  onUploadSuccess: (file: FileItem) => void;
  currentUser: User;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUploadSuccess, currentUser }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if(e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  }

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // STEP 1: Get Pre-Signed URL from Backend
      const uploadUrlResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/files/generate-upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': tokenService.getToken() || '',
        },
        body: JSON.stringify({
          filename: selectedFile.name,
          filetype: selectedFile.type,
        }),
      });

      if (!uploadUrlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, s3Key } = await uploadUrlResponse.json();

      // STEP 2: Upload File Directly to S3 with Progress Tracking
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      await new Promise<void>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            resolve();
          } else {
            reject(new Error('Upload failed'));
          }
        });
        xhr.addEventListener('error', () => reject(new Error('Upload failed')));
        
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', selectedFile.type);
        xhr.send(selectedFile);
      });

      // STEP 3: Finalize Upload with Backend
      const finalizeResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/files/finalize-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': tokenService.getToken() || '',
        },
        body: JSON.stringify({
          originalFilename: selectedFile.name,
          s3Key: s3Key,
          mimetype: selectedFile.type,
          fileSize: selectedFile.size,
        }),
      });

      if (!finalizeResponse.ok) {
        throw new Error('Failed to finalize upload');
      }

      const backendFile = await finalizeResponse.json();

      // Transform backend response to match frontend FileItem type
      const newFile: FileItem = {
        id: backendFile._id,
        name: backendFile.originalFilename,
        type: backendFile.mimetype as FileType,
        size: backendFile.fileSize,
        lastModified: new Date(backendFile.uploadDate || backendFile.createdAt),
        owner: backendFile.owner,
        s3Key: backendFile.s3Key,
      };

      onUploadSuccess(newFile);
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [selectedFile, onUploadSuccess, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-8 m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Upload File</h2>
          <button onClick={onClose} className="p-2 rounded-full text-zinc-500 hover:bg-zinc-800 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {!selectedFile ? (
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-zinc-700 rounded-xl p-8 sm:p-12 text-center bg-zinc-900/50 cursor-pointer hover:border-green-500 transition-colors"
          >
            <UploadCloud className="w-12 h-12 mx-auto text-zinc-500 mb-4" />
            <p className="text-white font-semibold">Drag & drop your file here</p>
            <p className="text-zinc-400 text-sm mt-1">or</p>
            <label htmlFor="file-upload" className="mt-4 inline-block bg-zinc-800 px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer hover:bg-zinc-700">
              Browse Files
            </label>
            <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
          </div>
        ) : (
          <div className="bg-zinc-800 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center min-w-0">
                <FileIcon className="w-8 h-8 text-zinc-400 flex-shrink-0" />
                <div className="ml-3 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{selectedFile.name}</p>
                    <p className="text-xs text-zinc-500">{Math.round(selectedFile.size / 1024)} KB</p>
                </div>
            </div>
            <button onClick={() => setSelectedFile(null)} className="p-1 rounded-full text-zinc-500 hover:bg-zinc-700">
                <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {isUploading && (
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-400">Uploading...</span>
                <span className="text-white">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="bg-green-500 text-black font-semibold px-6 py-2.5 rounded-lg disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed hover:bg-green-400 transition-colors"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
