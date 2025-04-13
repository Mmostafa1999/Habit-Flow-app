"use client";

import React from 'react';
import { Menu, X, Bell } from 'lucide-react';
import UserProfileCard from './UserProfileCard';

interface MobileHeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuToggle, isMenuOpen }) => {
  return (
    <header className="bg-white shadow-sm py-3 px-4 flex items-center justify-between md:hidden sticky top-0 z-30">
      <button
        onClick={onMenuToggle}
        className="p-1.5 rounded-full hover:bg-gray-100"
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <h1 className="text-lg font-bold text-[#E50046]">Habit Tracker</h1>

      <div className="flex items-center gap-2">
        <button
          className="p-1.5 rounded-full hover:bg-gray-100"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>
        <UserProfileCard compact />
      </div>
    </header>
  );
};

export default MobileHeader; 