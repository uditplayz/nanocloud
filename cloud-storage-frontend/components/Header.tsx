
import React, { useState } from 'react';
import { Search, Bell, Settings, Plus, Menu, LogOut } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User;
  onUploadClick: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onMenuClick: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onUploadClick, searchQuery, setSearchQuery, onMenuClick, onLogout }) => {
  const [isProfileOpen, setProfileOpen] = useState(false);

  return (
    <header className="flex-shrink-0 flex items-center justify-between p-4 md:px-8 border-b border-zinc-900 gap-4 relative z-30">
      <div className="flex items-center flex-1 min-w-0">
        <button onClick={onMenuClick} className="md:hidden mr-2 p-2 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative w-full max-w-xs sm:max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          />
        </div>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <button onClick={onUploadClick} className="flex items-center bg-green-500 text-black font-semibold px-3 sm:px-4 py-2 rounded-full hover:bg-green-400 transition-colors duration-200">
          <Plus className="w-5 h-5 sm:mr-2" />
          <span className="hidden sm:inline">Upload</span>
        </button>
        <button className="hidden sm:block p-2 rounded-full hover:bg-zinc-800 transition-colors">
          <Bell className="w-5 h-5 text-zinc-400" />
        </button>
        <button className="hidden sm:block p-2 rounded-full hover:bg-zinc-800 transition-colors">
          <Settings className="w-5 h-5 text-zinc-400" />
        </button>
        
        <div className="relative">
            <button onClick={() => setProfileOpen(!isProfileOpen)} className="focus:outline-none block">
                <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-zinc-700 hover:border-zinc-500 transition-colors object-cover"
                />
            </button>
            
            {isProfileOpen && (
                <>
                    <div className="fixed inset-0 z-0" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-3 border-b border-zinc-700">
                            <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                            <p className="text-xs text-zinc-400 truncate">{currentUser.email}</p>
                        </div>
                        <button 
                            onClick={() => { setProfileOpen(false); onLogout(); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-700 flex items-center transition-colors"
                        >
                            <LogOut className="w-4 h-4 mr-2" /> Sign out
                        </button>
                    </div>
                </>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;
