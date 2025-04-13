"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useStatistics } from '@/lib/hooks/useStatistics';
import { CheckCircleIcon, TrophyIcon, FireIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import StatisticsHeader from '@/components/statistics/StatisticsHeader';
import StatisticCard from '@/components/statistics/StatisticCard';
import CategoryChart from '@/components/statistics/CategoryChart';
import HabitCompletionList from '@/components/statistics/HabitCompletionList';
import StatisticsSkeleton from '@/components/statistics/StatisticsSkeleton';
import PageTransition from '@/components/common/PageTransition';

export default function StatisticsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { data, isLoading, error } = useStatistics();

    // Redirect to home if not authenticated
    useEffect(() => {
        if (!user) {
            router.push('/');
        }
        // Redirect to verify email if not verified
        else if (!user.emailVerified) {
            router.push('/verify-email');
        }
    }, [user, router]);

    if (!user) {
        return null; // Will redirect in useEffect
    }

    return (
        <PageTransition>
            <div className="container mx-auto px-4">
                <StatisticsHeader
                    title="Statistics"
                    description="Track your habit progress and completion rates"
                />

                {isLoading ? (
                    <StatisticsSkeleton />
                ) : error ? (
                    <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                        <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Statistics</h2>
                        <p className="text-gray-700">{error}</p>
                        <button
                            className="mt-4 bg-[#E50046] text-white px-4 py-2 rounded-md"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="mt-6">
                        {/* Statistics Overview Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <StatisticCard
                                title="Total Completions"
                                value={data?.totalCompletions || 0}
                                icon={<CheckCircleIcon className="h-6 w-6 text-[#E50046]" />}
                                subtitle="All time habit completions"
                            />

                            <StatisticCard
                                title="Current Streak"
                                value={`${data?.currentStreak || 0} day${data?.currentStreak !== 1 ? 's' : ''}`}
                                icon={<FireIcon className="h-6 w-6 text-[#E50046]" />}
                                subtitle="Days in a row with completions"
                            />

                            <StatisticCard
                                title="Longest Streak"
                                value={`${data?.longestStreak || 0} day${data?.longestStreak !== 1 ? 's' : ''}`}
                                icon={<TrophyIcon className="h-6 w-6 text-[#E50046]" />}
                                subtitle="Your best completion streak"
                            />

                            <StatisticCard
                                title="Completion Rate"
                                value={`${Math.round(data?.overallCompletionRate || 0)}%`}
                                icon={<ChartBarIcon className="h-6 w-6 text-[#E50046]" />}
                                subtitle="Average habit completion"
                            />
                        </div>

                        {/* Charts and Detailed Stats */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Category Completion Chart */}
                            <div className="bg-white rounded-xl shadow-sm p-4">
                                {data?.categoryStatistics && data.categoryStatistics.length > 0 ? (
                                    <CategoryChart categories={data.categoryStatistics} />
                                ) : (
                                    <div className="text-center py-6 text-gray-500">
                                        No category data available
                                    </div>
                                )}
                            </div>

                            {/* Habit Completion List */}
                            <div className="bg-white rounded-xl shadow-sm p-4">
                                {data?.habitCompletions && (
                                    <HabitCompletionList habits={data.habitCompletions} />
                                )}
                            </div>
                        </div>

                        {/* Last Updated */}
                        <div className="text-xs text-gray-500 mt-4 text-right">
                            Last updated: {data?.lastUpdated.toLocaleString()}
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    );
} 