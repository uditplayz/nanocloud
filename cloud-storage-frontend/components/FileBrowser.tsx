
import React from 'react';
import { FileItem } from '../types';
import FileCard from './FileCard';
import { FolderPlus } from 'lucide-react';

interface FileBrowserProps {
  files: FileItem[];
  onDeleteFile: (fileId: string) => void;
  onShareFile: (file: FileItem) => void;
  onPreviewFile: (file: FileItem) => void;
  onOpenCreateFolder: () => void;
}

const FileBrowser: React.FC<FileBrowserProps> = ({ files, onDeleteFile, onShareFile, onPreviewFile, onOpenCreateFolder }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">Recent Files</h2>
        <button
          onClick={onOpenCreateFolder}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-zinc-700"
        >
          <FolderPlus className="w-4 h-4 text-green-400" />
          <span className="hidden sm:inline">New Folder</span>
        </button>
      </div>
      
      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-zinc-500 text-center px-4 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
            <p className="text-lg font-medium text-zinc-400">No files found</p>
            <p className="text-sm mt-1">Upload a file or create a folder to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {files.map((file) => (
            <FileCard key={file.id} file={file} onDelete={onDeleteFile} onShare={onShareFile} onPreview={onPreviewFile} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileBrowser;
