import React, { ReactNode } from 'react';

interface StatisticCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export default function StatisticCard({
  title,
  value,
  icon,
  subtitle,
  trend,
  color = '#E50046'  // Default app color
}: StatisticCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col h-full">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon && (
          <div className="rounded-full p-2" style={{ backgroundColor: `${color}15` }}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-end gap-2 mt-auto">
        <span className="text-2xl font-bold" style={{ color }}>{value}</span>
        
        {trend && (
          <div 
            className={`flex items-center text-xs font-medium ${
              trend.isPositive ? 'text-green-500' : 'text-red-500'
            }`}
          >
            <span className="mr-1">
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
          </div>
        )}
      </div>
      
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
} 