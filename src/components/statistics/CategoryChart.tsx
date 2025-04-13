import React from 'react';
import { CategoryStatistics } from '@/lib/hooks/useStatistics';

interface CategoryChartProps {
    categories: CategoryStatistics[];
}

export default function CategoryChart({ categories }: CategoryChartProps) {
    // Sort categories by completion rate
    const sortedCategories = [...categories].sort((a, b) => b.completionRate - a.completionRate);

    return (
        <div className="w-full">
            <h3 className="text-lg font-semibold mb-3">Completion Rate by Category</h3>

            <div className="space-y-4">
                {sortedCategories.map(category => (
                    <div key={category.id} className="space-y-1">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: category.color }}
                                />
                                <span className="text-sm font-medium">{category.name}</span>
                            </div>
                            <span className="text-sm font-medium">{Math.round(category.completionRate)}%</span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="h-2.5 rounded-full"
                                style={{
                                    width: `${Math.round(category.completionRate)}%`,
                                    backgroundColor: category.color
                                }}
                            />
                        </div>

                        <div className="flex justify-between text-xs text-gray-500">
                            <span>{category.completedCount} completed</span>
                            <span>{category.habitCount} habits</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 