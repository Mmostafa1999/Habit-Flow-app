"use client";

import React from 'react';
import { Bell, Settings } from 'lucide-react';
import UserProfileCard from './UserProfileCard';

interface DashboardHeaderProps { }

const DashboardHeader: React.FC<DashboardHeaderProps> = () => {
    return (
        <header className="bg-white border-b py-4 px-6 hidden md:flex items-center justify-between sticky top-0 z-20">
            <div className="flex-1">
                <UserProfileCard />
            </div>

            <div className="flex-1 flex justify-end gap-3">
                <button
                    className="p-2 rounded-full hover:bg-gray-100 relative"
                    aria-label="Notifications"
                >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-[#E50046] rounded-full"></span>
                </button>
                <button
                    className="p-2 rounded-full hover:bg-gray-100"
                    aria-label="Settings"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
};

export default DashboardHeader; 