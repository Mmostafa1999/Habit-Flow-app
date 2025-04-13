"use client";

import DashboardLayout from '@/components/layout/DashboardLayout';
import { ReactNode } from 'react';

interface StatisticsLayoutProps {
    children: ReactNode;
}

export default function StatisticsLayout({ children }: StatisticsLayoutProps) {
    return <DashboardLayout>{children}</DashboardLayout>;
} 