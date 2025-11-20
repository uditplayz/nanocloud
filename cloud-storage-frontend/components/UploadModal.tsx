import React, { useState, useCallback } from 'react';
import { X, UploadCloud, File as FileIcon } from 'lucide-react';
import { FileItem, FileType, User } from '../types';

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

  const simulateUpload = useCallback(async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Step 1: (Mock) Get Pre-Signed URL from backend
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockPresignedUrl = `https://s3.amazonaws.com/nanocloud-bucket/uploads/${currentUser.id}/${Date.now()}-${selectedFile.name}`;
    console.log("Got pre-signed URL:", mockPresignedUrl);

    // Step 2: (Mock) Upload File Directly to S3
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate upload time

    // Step 3: (Mock) Finalize Upload with our Backend
    await new Promise(resolve => setTimeout(resolve, 500));
    const newFile: FileItem = {
      id: `file_${Date.now()}`,
      name: selectedFile.name,
      type: selectedFile.type as FileType,
      size: selectedFile.size,
      lastModified: new Date(),
      owner: currentUser.id,
      s3Key: mockPresignedUrl.split('amazonaws.com/')[1],
    };

    console.log("Finalized upload, created metadata:", newFile);
    onUploadSuccess(newFile);
    setIsUploading(false);
  }, [selectedFile, onUploadSuccess, currentUser]);

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
            onClick={simulateUpload}
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
