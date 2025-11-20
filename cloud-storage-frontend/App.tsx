
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { tokenService } from './services/tokenService';
import { fileService } from './services/fileService';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import FileBrowser from './components/FileBrowser';
import UploadModal from './components/UploadModal';
import ShareModal from './components/ShareModal';
import FilePreviewModal from './components/FilePreviewModal';
import AuthScreen from './components/AuthScreen';
import CreateFolderModal from './components/CreateFolderModal';
import { NavSection, FileItem, User, SharingInfo, FileType } from './types';
import { MOCK_FILES } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<NavSection>(NavSection.RECENT);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [fileToShare, setFileToShare] = useState<FileItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [fileToPreview, setFileToPreview] = useState<FileItem | null>(null);

  const loadFiles = useCallback(async () => {
    try {
      const fetchedFiles = await fileService.getFiles();
      setFiles(fetchedFiles);
    } catch (error) {
      console.error('Failed to load files:', error);
      alert('Failed to load files');
    }
  }, []);

  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user);
  }, []);

  const handleLogout = useCallback(() => {
    tokenService.removeToken();
    setCurrentUser(null);
    setFiles([]); // Clear files on logout
  }, []);

  useEffect(() => {
    // On mount, check for existing token
    const token = tokenService.getToken();
    if (token) {
      setCurrentUser({
        id: 'stored_user',
        name: 'User',
        email: 'user@example.com',
        avatarUrl: ''
      });
    }
    setIsLoading(false);
  }, []);

  // Load files when user logs in
  useEffect(() => {
    if (currentUser) {
      loadFiles();
    }
  }, [currentUser, loadFiles]);

  const handleUploadSuccess = useCallback((newFile: FileItem) => {
    setFiles(prevFiles => [newFile, ...prevFiles]);
    setUploadModalOpen(false);
  }, []);
  
  const handleCreateFolder = useCallback((folderName: string) => {
    if (!currentUser) return;
    const newFolder: FileItem = {
      id: `folder_${Date.now()}`,
      name: folderName,
      type: FileType.FOLDER,
      size: 0,
      lastModified: new Date(),
      owner: currentUser.id,
      s3Key: '',
      sharingInfo: {
        isPublic: false,
        publicLink: '',
        collaborators: []
      }
    };
    setFiles(prevFiles => [newFolder, ...prevFiles]);
    setCreateFolderModalOpen(false);
  }, [currentUser]);

  
  const handleDeleteFile = useCallback(async (fileId: string) => {
      try {
        await fileService.deleteFile(fileId);
        setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
      } catch (error) {
        console.error('Failed to delete file:', error);
        alert('Failed to delete file');
      }
    }, []);

  const handleOpenShareModal = useCallback((file: FileItem) => {
    setFileToShare(file);
    setShareModalOpen(true);
  }, []);

  const handleCloseShareModal = useCallback(() => {
    setFileToShare(null);
    setShareModalOpen(false);
  }, []);

  const handleUpdateSharingInfo = useCallback((fileId: string, updatedInfo: SharingInfo) => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === fileId ? { ...file, sharingInfo: updatedInfo } : file
      )
    );
     if (fileToShare && fileToShare.id === fileId) {
      setFileToShare(prev => prev ? { ...prev, sharingInfo: updatedInfo } : null);
    }
  }, [fileToShare]);

  const handleOpenFilePreview = useCallback((file: FileItem) => {
    if (file.type === FileType.FOLDER) return;
    setFileToPreview(file);
    setIsPreviewModalOpen(true);
  }, []);

  const handleCloseFilePreview = useCallback(() => {
    setFileToPreview(null);
    setIsPreviewModalOpen(false);
  }, []);

  const filteredFiles = useMemo(() => {
    if (!searchQuery) {
      return files;
    }
    return files.filter(file =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [files, searchQuery]);

  if (isLoading) return <div>Loading...</div>;

  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-black font-sans overflow-hidden">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          currentUser={currentUser} 
          onUploadClick={() => setUploadModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />
        <FileBrowser 
          files={filteredFiles} 
          onDeleteFile={handleDeleteFile} 
          onShareFile={handleOpenShareModal}
          onPreviewFile={handleOpenFilePreview}
          onOpenCreateFolder={() => setCreateFolderModalOpen(true)}
        />
      </main>
      {isUploadModalOpen && (
        <UploadModal
          onClose={() => setUploadModalOpen(false)}
          onUploadSuccess={handleUploadSuccess}
          currentUser={currentUser}
        />
      )}
      {isCreateFolderModalOpen && (
        <CreateFolderModal
          onClose={() => setCreateFolderModalOpen(false)}
          onCreate={handleCreateFolder}
        />
      )}
      {isShareModalOpen && fileToShare && (
        <ShareModal
          file={fileToShare}
          onClose={handleCloseShareModal}
          onUpdateSharing={handleUpdateSharingInfo}
          currentUser={currentUser}
        />
      )}
      {isPreviewModalOpen && fileToPreview && (
        <FilePreviewModal
          file={fileToPreview}
          onClose={handleCloseFilePreview}
        />
      )}
    </div>
  );
};

export default App;
