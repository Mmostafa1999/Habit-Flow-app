"use client";

import DashboardLayout from '@/components/layout/DashboardLayout';
import { ReactNode } from 'react';

interface DashboardLayoutWrapperProps {
  children: ReactNode;
}

export default function DashboardLayoutWrapper({ children }: DashboardLayoutWrapperProps) {
  return <DashboardLayout>{children}</DashboardLayout>;
} 