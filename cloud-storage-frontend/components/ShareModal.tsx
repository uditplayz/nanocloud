
import React, { useState, useMemo, useCallback } from 'react';
import { X, Share2, Link, Copy, Users, ChevronDown, FileText, FileImage, File, Folder } from 'lucide-react';
import { FileItem, User, PermissionLevel, Collaborator, FileType, SharingInfo } from '../types';
import { MOCK_USERS } from '../constants';

interface ShareModalProps {
  file: FileItem;
  onClose: () => void;
  onUpdateSharing: (fileId: string, updatedInfo: SharingInfo) => void;
  currentUser: User;
}

const getFileIcon = (type: FileType) => {
  switch (type) {
    case FileType.PDF: return <FileText className="w-6 h-6 text-red-400" />;
    case FileType.PNG: case FileType.JPG: return <FileImage className="w-6 h-6 text-blue-400" />;
    case FileType.DOCX: return <FileText className="w-6 h-6 text-sky-400" />;
    case FileType.TXT: return <FileText className="w-6 h-6 text-gray-400" />;
    case FileType.FOLDER: return <Folder className="w-6 h-6 text-yellow-400" />;
    default: return <File className="w-6 h-6 text-zinc-500" />;
  }
};

const ShareModal: React.FC<ShareModalProps> = ({ file, onClose, onUpdateSharing, currentUser }) => {
  const initialSharingInfo = useMemo(() => file.sharingInfo ?? {
    isPublic: false,
    publicLink: `https://nanocloud.dev/share/${Math.random().toString(36).substring(2, 10)}`,
    collaborators: [],
  }, [file.sharingInfo]);

  const [sharingInfo, setSharingInfo] = useState<SharingInfo>(initialSharingInfo);
  const [inviteEmail, setInviteEmail] = useState('');
  const [permission, setPermission] = useState<PermissionLevel>(PermissionLevel.VIEW);
  const [copyButtonText, setCopyButtonText] = useState('Copy');
  
  const handleUpdate = useCallback((newInfo: SharingInfo) => {
    setSharingInfo(newInfo);
    onUpdateSharing(file.id, newInfo);
  }, [file.id, onUpdateSharing]);
  
  const handleInvite = () => {
    if (!inviteEmail || sharingInfo.collaborators.some(c => c.user.email === inviteEmail)) return;
    
    // In a real app, you'd look up the user by email. Here we mock it.
    const userToInvite = MOCK_USERS.find(u => u.email === inviteEmail) ?? {
      id: `user_${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      avatarUrl: `https://i.pravatar.cc/150?u=${inviteEmail}`
    };

    const newCollaborator: Collaborator = { user: userToInvite, permission };
    const updatedInfo = {
      ...sharingInfo,
      collaborators: [...sharingInfo.collaborators, newCollaborator],
    };
    handleUpdate(updatedInfo);
    setInviteEmail('');
  };

  const handleRemoveCollaborator = (userId: string) => {
    const updatedInfo = {
      ...sharingInfo,
      collaborators: sharingInfo.collaborators.filter(c => c.user.id !== userId),
    };
    handleUpdate(updatedInfo);
  };
  
  const handlePermissionChange = (userId: string, newPermission: PermissionLevel) => {
    const updatedInfo = {
        ...sharingInfo,
        collaborators: sharingInfo.collaborators.map(c => 
            c.user.id === userId ? { ...c, permission: newPermission } : c
        ),
    };
    handleUpdate(updatedInfo);
  };
  
  const handleTogglePublicLink = (isPublic: boolean) => {
    const updatedInfo = { ...sharingInfo, isPublic };
    handleUpdate(updatedInfo);
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(sharingInfo.publicLink);
    setCopyButtonText('Copied!');
    setTimeout(() => setCopyButtonText('Copy'), 2000);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b border-zinc-800">
          <div className="flex items-center min-w-0">
            {getFileIcon(file.type)}
            <span className="ml-3 font-semibold text-white truncate">{file.name}</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-zinc-500 hover:bg-zinc-800 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Invite Collaborators */}
          <div>
            <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center"><Users className="w-4 h-4 mr-2"/>Share with people</h3>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter email address..." 
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-grow bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button onClick={handleInvite} className="bg-green-500 text-black font-semibold px-4 py-2 rounded-lg text-sm hover:bg-green-400 transition-colors">Invite</button>
            </div>
          </div>
          
          {/* Collaborators List */}
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
             <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-full" />
                    <div className="ml-3">
                        <p className="text-sm font-medium text-white">{currentUser.name} (You)</p>
                        <p className="text-xs text-zinc-400">{currentUser.email}</p>
                    </div>
                </div>
                <span className="text-sm text-zinc-500">Owner</span>
            </div>
            {sharingInfo.collaborators.map(({ user, permission }) => (
                <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                        <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-white">{user.name}</p>
                            <p className="text-xs text-zinc-400">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                          value={permission}
                          onChange={(e) => handlePermissionChange(user.id, e.target.value as PermissionLevel)}
                          className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-green-500"
                        >
                            <option>{PermissionLevel.VIEW}</option>
                            <option>{PermissionLevel.EDIT}</option>
                        </select>
                        <button onClick={() => handleRemoveCollaborator(user.id)} className="text-zinc-500 hover:text-white p-1">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
          </div>
          
          <hr className="border-zinc-800" />
          
          {/* Public Link */}
          <div>
            <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center"><Link className="w-4 h-4 mr-2"/>General access</h3>
            <div className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-lg">
                <p className="text-sm text-white">Share a public link</p>
                 <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={sharingInfo.isPublic} onChange={(e) => handleTogglePublicLink(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-green-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
            </div>
            {sharingInfo.isPublic && (
                <div className="flex gap-2 mt-3">
                    <input 
                        type="text" 
                        readOnly 
                        value={sharingInfo.publicLink}
                        className="flex-grow bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none"
                    />
                    <button onClick={handleCopyLink} className="bg-zinc-700 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-zinc-600 transition-colors flex items-center gap-2">
                        <Copy className="w-4 h-4" /> {copyButtonText}
                    </button>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
