
import React, { useState } from 'react';
import { FileItem, FileType } from '../types';
import { FileText, FileImage, File, Folder, MoreVertical, Download, Trash2, Sparkles, Share2 } from 'lucide-react';
import { summarizeText } from '../services/geminiService';
import { tokenService } from '../services/tokenService';

interface FileCardProps {
  file: FileItem;
  onDelete: (fileId: string) => void;
  onShare: (file: FileItem) => void;
  onPreview: (file: FileItem) => void;
}

const getFileIcon = (type: FileType) => {
  switch (type) {
    case FileType.PDF:
      return <FileText className="w-8 h-8 text-red-400" />;
    case FileType.PNG:
    case FileType.JPG:
      return <FileImage className="w-8 h-8 text-blue-400" />;
    case FileType.DOCX:
      return <FileText className="w-8 h-8 text-sky-400" />;
    case FileType.TXT:
      return <FileText className="w-8 h-8 text-gray-400" />;
    case FileType.FOLDER:
        return <Folder className="w-8 h-8 text-yellow-400" />;
    default:
      return <File className="w-8 h-8 text-zinc-500" />;
  }
};

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const FileCard: React.FC<FileCardProps> = ({ file, onDelete, onShare, onPreview }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handleSummarize = async () => {
    setIsSummarizing(true);
    setSummary(null);
    try {
      const result = await summarizeText(`This is the content of the file named: ${file.name}. Please provide a short summary.`);
      setSummary(result);
    } catch (error) {
      console.error("Summarization failed:", error);
      setSummary("Could not generate summary.");
    } finally {
      setIsSummarizing(false);
    }
  };
  
  const isSummarizable = file.type === FileType.TXT || file.type === FileType.DOCX || file.type === FileType.PDF;

  const handleCardClick = () => {
    if (file.type !== FileType.FOLDER) {
      onPreview(file);
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!isMenuOpen);
  };

  const handleDownload = async (e: React.MouseEvent) => {
  e.stopPropagation();
  setMenuOpen(false);
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/files/download/${file.id}`, {
      method: 'GET',
      headers: {
        'x-auth-token': tokenService.getToken() || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get download URL');
    }

    const { downloadUrl } = await response.json();
    
    // Trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Download failed:', error);
    alert('Download failed. Please try again.');
  }
};


  return (
    <div 
      className={`bg-zinc-900 rounded-xl p-4 flex flex-col justify-between group relative transition-all duration-200 hover:bg-zinc-800 hover:shadow-lg hover:shadow-green-500/10 ${file.type !== FileType.FOLDER ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={handleCardClick}
    >
      <div className="flex items-center mb-4">
        {getFileIcon(file.type)}
        <div className="flex-1 min-w-0 ml-3">
          <p className="text-sm font-medium text-white truncate">{file.name}</p>
          <p className="text-xs text-zinc-400">{file.type !== FileType.FOLDER ? formatBytes(file.size) : 'Folder'}</p>
        </div>
      </div>

      {summary && (
        <div className="my-2 p-3 bg-zinc-800 rounded-lg">
          <p className="text-xs text-zinc-300 italic">{summary}</p>
        </div>
      )}
      
      {isSummarizing && (
        <div className="my-2 p-3 text-center text-xs text-zinc-400">Generating summary...</div>
      )}

      <div className="flex justify-between items-center text-xs text-zinc-500">
        <span>{file.lastModified.toLocaleDateString()}</span>
        <div className="relative">
          <button onClick={handleMenuClick} className="p-1 rounded-full hover:bg-zinc-700">
            <MoreVertical className="w-4 h-4" />
          </button>
          {isMenuOpen && (
            <div 
              onClick={e => e.stopPropagation()}
              className="absolute right-0 bottom-full mb-2 w-40 bg-zinc-800 rounded-lg shadow-xl z-10 border border-zinc-700"
            >
              {isSummarizable && (
                <button onClick={handleSummarize} className="w-full text-left flex items-center px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 rounded-t-lg">
                  <Sparkles className="w-4 h-4 mr-2" /> Summarize
                </button>
              )}
               <button onClick={() => { onShare(file); setMenuOpen(false); }} className="w-full text-left flex items-center px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700">
                <Share2 className="w-4 h-4 mr-2" /> Share
              </button>
              <button 
                onClick={handleDownload}  // Add this handler
                className="w-full text-left flex items-center px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
              >
                <Download className="w-4 h-4 mr-2" /> Download
              </button>

              <button onClick={() => onDelete(file.id)} className="w-full text-left flex items-center px-3 py-2 text-sm text-red-400 hover:bg-zinc-700 rounded-b-lg">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileCard;
