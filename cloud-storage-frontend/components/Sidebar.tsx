import React from 'react';
import { NavSection } from '../types';
import { Heart, Star, Folder, Trash2, CloudDrizzle, X } from 'lucide-react';

interface SidebarProps {
  activeSection: NavSection;
  setActiveSection: (section: NavSection) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface NavItemProps {
  icon: React.ElementType;
  label: NavSection;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
        isActive
          ? 'bg-zinc-800 text-white'
          : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
      }`}
    >
      <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-green-400' : ''}`} />
      {label}
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, isOpen, setIsOpen }) => {
  const navItems = [
    { icon: Heart, label: NavSection.RECENT },
    { icon: Star, label: NavSection.STARRED },
    { icon: Folder, label: NavSection.BROWSE },
    { icon: Trash2, label: NavSection.TRASH },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      ></div>
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-black p-4 flex flex-col border-r border-zinc-900 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-10 px-2">
            <div className="flex items-center">
                <CloudDrizzle className="w-8 h-8 text-green-400" />
                <h1 className="text-xl font-bold ml-2 text-white">nanocloud</h1>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 text-zinc-400 hover:text-white md:hidden">
                <X className="w-6 h-6" />
            </button>
        </div>
        <nav className="flex flex-col space-y-2">
          {navItems.map((item) => (
            <NavItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              isActive={activeSection === item.label}
              onClick={() => {
                setActiveSection(item.label)
                setIsOpen(false);
              }}
            />
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
