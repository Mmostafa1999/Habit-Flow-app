import React from 'react';

export default function StatisticsSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Header Skeleton */}
            <div className="mb-6">
                <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm p-4 h-[120px]">
                        <div className="flex justify-between">
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-1/3 mt-4"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3 mt-2"></div>
                    </div>
                ))}
            </div>

            {/* Category Chart Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="mb-4">
                            <div className="flex justify-between mb-2">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-[40px]"></div>
                            </div>
                            <div className="h-3 bg-gray-200 rounded-full w-full"></div>
                        </div>
                    ))}
                </div>

                {/* Habit Completion Skeleton */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <div className="h-6 bg-gray-200 rounded w-2/5 mb-4"></div>

                    {Array.from({ length: 2 }).map((_, index) => (
                        <div key={index} className="bg-gray-100 rounded-lg p-3 mb-3">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                                <div>
                                    <div className="h-4 bg-gray-200 rounded w-[120px] mb-1"></div>
                                    <div className="h-3 bg-gray-200 rounded w-[80px]"></div>
                                </div>
                            </div>

                            <div className="flex justify-between mb-2">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-[40px]"></div>
                            </div>

                            <div className="h-2 bg-gray-200 rounded-full w-full mb-3"></div>

                            <div className="grid grid-cols-2 gap-2">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i}>
                                        <div className="h-3 bg-gray-200 rounded w-2/3 mb-1"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 