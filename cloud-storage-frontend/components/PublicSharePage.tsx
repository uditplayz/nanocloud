import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, FileText, FileImage, File as FileIcon, Loader2, AlertCircle } from 'lucide-react';

interface SharedFileInfo {
  filename: string;
  size: number;
  mimetype: string;
  downloadUrl: string;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const getFileIcon = (mimetype: string) => {
  if (mimetype.startsWith('image/')) {
    return <FileImage className="w-16 h-16 text-blue-400" />;
  } else if (mimetype === 'application/pdf') {
    return <FileText className="w-16 h-16 text-red-400" />;
  } else if (mimetype.includes('document') || mimetype.includes('text')) {
    return <FileText className="w-16 h-16 text-sky-400" />;
  }
  return <FileIcon className="w-16 h-16 text-zinc-500" />;
};

const PublicSharePage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  const [fileInfo, setFileInfo] = useState<SharedFileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchSharedFile = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/sharing/public/${shareToken}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('File not found or sharing has been disabled');
          }
          throw new Error('Failed to load shared file');
        }

        const data = await response.json();
        setFileInfo(data);
      } catch (err: any) {
        console.error('Error fetching shared file:', err);
        setError(err.message || 'Failed to load file');
      } finally {
        setLoading(false);
      }
    };

    if (shareToken) {
      fetchSharedFile();
    }
  }, [shareToken]);

  const handleDownload = () => {
    if (!fileInfo) return;
    
    setDownloading(true);
    try {
      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = fileInfo.downloadUrl;
      link.download = fileInfo.filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Download failed. Please try again.');
    } finally {
      setTimeout(() => setDownloading(false), 1000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading shared file...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 rounded-2xl p-8 border border-zinc-800 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Unable to Load File</h1>
          <p className="text-zinc-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!fileInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-6 border-b border-zinc-800">
          <h1 className="text-2xl font-bold text-white mb-2">Shared File</h1>
          <p className="text-zinc-400 text-sm">Someone shared this file with you via NanoCloud</p>
        </div>

        {/* File Info */}
        <div className="p-8">
          <div className="flex items-center justify-center mb-6">
            {getFileIcon(fileInfo.mimetype)}
          </div>

          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-white mb-2 break-words">
              {fileInfo.filename}
            </h2>
            <p className="text-zinc-400">{formatBytes(fileInfo.size)}</p>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-600 disabled:cursor-not-allowed text-black font-semibold px-6 py-4 rounded-lg transition-colors flex items-center justify-center gap-3 text-lg"
          >
            {downloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download File
              </>
            )}
          </button>

          {/* Info */}
          <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <p className="text-xs text-zinc-400 text-center">
              This file is shared publicly. Download it to view the contents.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-zinc-800/50 p-4 border-t border-zinc-800 text-center">
          <p className="text-sm text-zinc-500">
            Powered by <span className="text-green-400 font-semibold">NanoCloud</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicSharePage;
