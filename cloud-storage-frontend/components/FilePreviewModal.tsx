import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { FileItem } from '../types';
import { tokenService } from '../services/tokenService';

interface FilePreviewModalProps {
  file: FileItem;
  onClose: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreviewUrl = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/files/download/${file.id}`, {
          method: 'GET',
          headers: {
            'x-auth-token': tokenService.getToken() || '',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to get preview URL');
        }

        const { downloadUrl } = await response.json();
        setPreviewUrl(downloadUrl);
      } catch (err) {
        console.error('Preview failed:', err);
        setError('Failed to load preview');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreviewUrl();
  }, [file.id]);

  const handleDownload = () => {
    if (previewUrl) {
      const link = document.createElement('a');
      link.href = previewUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isImage = file.type.includes('image');
  const isPDF = file.type.includes('pdf');
  const isText = file.type.includes('text');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-zinc-800">
          <div className="flex items-center min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-white truncate">{file.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={!previewUrl}
              className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <p className="text-zinc-400">Loading preview...</p>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {!isLoading && !error && previewUrl && (
            <>
              {isImage && (
                <img
                  src={previewUrl}
                  alt={file.name}
                  className="max-w-full max-h-full mx-auto rounded-lg"
                />
              )}

              {isPDF && (
                <iframe
                  src={previewUrl}
                  className="w-full h-[70vh] rounded-lg"
                  title={file.name}
                />
              )}

              {isText && (
                <iframe
                  src={previewUrl}
                  className="w-full h-[70vh] rounded-lg bg-white"
                  title={file.name}
                />
              )}

              {!isImage && !isPDF && !isText && (
                <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                  <p className="mb-4">Preview not available for this file type</p>
                  <button
                    onClick={handleDownload}
                    className="bg-green-500 text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-green-400"
                  >
                    Download to View
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
