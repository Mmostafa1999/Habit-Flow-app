import React from 'react';

interface StatisticsHeaderProps {
  title: string;
  description?: string;
}

export default function StatisticsHeader({ title, description }: StatisticsHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      {description && (
        <p className="text-gray-600 mt-1">{description}</p>
      )}
    </div>
  );
} 