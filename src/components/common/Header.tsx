"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import Logo from './Logo';

export interface HeaderProps {
    variant?: 'auth' | 'dashboard';
    title?: string;
}

const Header: React.FC<HeaderProps> = ({
    variant = 'auth',
    title = 'Habit Tracker'
}) => {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    return (
        <header
            className="py-4 px-12 flex justify-between items-center bg-white shadow-lg sticky top-0 z-10"
           
        >
            <div className="flex items-center">
                <Logo  />
                <span
                    className=" font-bold text-xl"
                >
                    {title}
                </span>
            </div>

            {variant === 'auth' ? (
                <div className="space-x-4 flex">
                    <Link
                        href="/"
                        className="text-gray-700 font-bold hover:text-gray-900 transition-colors duration-300  py-1 rounded hover:bg-gray-100"
                    >
                        Login
                    </Link>
                    <Link
                        href="/signup"
                        className="text-gray-700 font-bold hover:text-gray-900 transition-colors duration-300 px-3 py-1 rounded hover:bg-gray-100"
                    >
                        Sign Up
                    </Link>
                </div>
            ) : (
                <div className="flex items-center gap-4">
                    {user?.email && (
                        <span className="text-sm text-gray-600 hidden md:inline">
                            {user.email}
                        </span>
                    )}
                    <button
                        onClick={handleLogout}
                        className="text-gray-700 hover:text-gray-900 transition-colors duration-300 px-3 py-1 rounded hover:bg-gray-100"
                    >
                        Logout
                    </button>
                </div>
            )}
        </header>
    );
};

export default Header; 