
import React from 'react';
import { X, FileText, FileImage, File, Folder, Download } from 'lucide-react';
import { FileItem, FileType } from '../types';

const getFileIcon = (type: FileType, className = "w-8 h-8") => {
  switch (type) {
    case FileType.PDF: return <FileText className={`${className} text-red-400`} />;
    case FileType.PNG: case FileType.JPG: return <FileImage className={`${className} text-blue-400`} />;
    case FileType.DOCX: return <FileText className={`${className} text-sky-400`} />;
    case FileType.TXT: return <FileText className={`${className} text-gray-400`} />;
    case FileType.FOLDER: return <Folder className={`${className} text-yellow-400`} />;
    default: return <File className={`${className} text-zinc-500`} />;
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

interface FilePreviewModalProps {
  file: FileItem;
  onClose: () => void;
}

const PreviewContent: React.FC<{file: FileItem}> = ({ file }) => {
    switch (file.type) {
        case FileType.PNG:
        case FileType.JPG:
            return (
                <div className="flex justify-center items-center h-full bg-zinc-900/50 rounded-lg">
                    <img 
                        src={`https://picsum.photos/seed/${file.id}/1200/800`} 
                        alt={`Preview of ${file.name}`} 
                        className="max-w-full max-h-full object-contain rounded-md"
                    />
                </div>
            );
        case FileType.PDF:
             return (
                <iframe
                    src="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                    title={`Preview of ${file.name}`}
                    className="w-full h-full border-0 rounded-lg bg-white"
                />
            );
        case FileType.TXT:
            return (
                <div className="w-full h-full bg-zinc-800 p-4 rounded-lg overflow-auto">
                    <pre className="text-zinc-300 text-sm whitespace-pre-wrap">
                        {`This is a preview of the text file: ${file.name}\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam. Proin sed libero.`}
                    </pre>
                </div>
            )
        case FileType.DOCX:
             return (
                 <div className="flex flex-col justify-center items-center h-full text-center bg-zinc-800/50 rounded-lg p-8">
                     {getFileIcon(file.type, "w-16 h-16")}
                     <p className="mt-4 text-lg font-semibold text-white">Live preview not available</p>
                     <p className="text-zinc-400 mt-1">Previews for Word Documents (.docx) are not supported.</p>
                     <p className="text-zinc-500 text-sm mt-4">You can download the file to view its content or generate an AI summary.</p>
                 </div>
             );
        default:
            return (
                <div className="flex flex-col justify-center items-center h-full text-center bg-zinc-800/50 rounded-lg p-8">
                    {getFileIcon(file.type, "w-16 h-16")}
                    <p className="mt-4 text-lg font-semibold text-white">Preview not available</p>
                    <p className="text-zinc-400 mt-1">No preview is available for this file type.</p>
                </div>
            )
    }
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-lg p-4 sm:p-8" onClick={onClose}>
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full h-full max-w-6xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-zinc-800">
          <div className="flex items-center min-w-0">
            {getFileIcon(file.type, "w-6 h-6")}
            <div className="ml-3 min-w-0">
                <p className="font-semibold text-white truncate">{file.name}</p>
                <p className="text-xs text-zinc-400">{formatBytes(file.size)} &middot; {file.lastModified.toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 bg-zinc-800 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-zinc-700 transition-colors">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
            </button>
            <button onClick={onClose} className="p-2 rounded-full text-zinc-500 hover:bg-zinc-800 hover:text-white">
                <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-hidden">
            <PreviewContent file={file} />
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
