"use client";

import React, { useState, ReactNode } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="min-h-screen bg-[#f8f9ef] flex flex-col md:flex-row">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={toggleMobileMenu}
                />
            )}

            {/* Sidebar - fixed on mobile when open, always visible and fixed on desktop */}
            <div
                className={`
          ${isMobileMenuOpen ? 'fixed inset-y-0 left-0 z-50 w-64' : 'hidden'} 
          md:sticky md:block md:w-60 md:top-0 md:self-start md:h-screen
        `}
            >
                <Sidebar
                    isMobile={isMobileMenuOpen}
                    onClose={toggleMobileMenu}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Mobile Header - hamburger button */}
                <div className="md:hidden bg-white p-4 flex items-center border-b sticky top-0 z-10">
                    <button
                        onClick={toggleMobileMenu}
                        className="p-2 rounded-md hover:bg-gray-100"
                        aria-label="Toggle menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className="ml-4 text-xl font-bold text-[#E50046]">Habit Tracker</h1>
                </div>

                {/* Desktop Header */}
                <DashboardHeader />

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout; 