"use client";

import DashboardLayout from '@/components/layout/DashboardLayout';
import { ReactNode } from 'react';

interface ProfileLayoutProps {
  children: ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return <DashboardLayout>{children}</DashboardLayout>;
} 