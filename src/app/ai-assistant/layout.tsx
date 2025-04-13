"use client";

import DashboardLayout from '@/components/layout/DashboardLayout';
import { ReactNode } from 'react';

interface AiAssistantLayoutProps {
  children: ReactNode;
}

export default function AiAssistantLayout({ children }: AiAssistantLayoutProps) {
  return <DashboardLayout>{children}</DashboardLayout>;
} 