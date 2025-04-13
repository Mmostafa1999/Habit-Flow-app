"use client";

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import {
    BarChart2,
    CheckSquare,
    User,
    Bot,
    LogOut
} from 'lucide-react';

interface SidebarProps {
    isMobile?: boolean;
    onClose?: () => void;
}

const Sidebar = ({ isMobile = false, onClose }: SidebarProps) => {
    const { logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const navItems = [
        { label: 'All Habits', icon: <CheckSquare className="w-5 h-5" />, path: '/dashboard' },
        { label: 'Statistics', icon: <BarChart2 className="w-5 h-5" />, path: '/statistics' },
        { label: 'Profile', icon: <User className="w-5 h-5" />, path: '/profile' },
        { label: 'AI Assistant', icon: <Bot className="w-5 h-5" />, path: '/ai-assistant' },
    ];

    const handleNavClick = () => {
        if (isMobile && onClose) {
            onClose();
        }
    };

    return (
        <aside className={`bg-white shadow-md flex flex-col ${isMobile ? 'w-full' : 'w-60'} h-screen overflow-y-auto sticky top-0`}>
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold text-[#E50046]">Habit Tracker</h2>
            </div>
            <nav className="flex-1 py-4 overflow-y-auto">
                <ul className="space-y-1">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                href={item.path}
                                onClick={handleNavClick}
                                className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-[#E50046] transition-colors ${pathname === item.path ? 'bg-gray-100 text-[#E50046] font-medium' : ''
                                    }`}
                            >
                                <span className="mr-3">{item.icon}</span>
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="p-4 border-t mt-auto">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-[#E50046] transition-colors rounded"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar; 