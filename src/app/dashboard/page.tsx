"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useHabits } from "@/lib/hooks/useHabits";
import { useCategories } from "@/lib/hooks/useCategories";
import { toast } from "react-toastify";
import PageTransition from "@/components/common/PageTransition";
import LoadingScreen from "@/components/common/LoadingScreen";
import usePageLoading from "@/lib/hooks/usePageLoading";

import MobileHeader from "@/components/dashboard/MobileHeader";
import HabitList from "@/components/dashboard/HabitList";
import ProgressCircle from "@/components/dashboard/ProgressCircle";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import CategoryFilter from "@/components/dashboard/CategoryFilter";
import AddHabitButton from "@/components/habits/AddHabitButton";
import CategoryModal from "@/components/categories/CategoryModal";

// Utility function to check if two dates are the same day
const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
};

export default function DashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { initialLoading } = usePageLoading({ initialDelay: 1000 });
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [categoriesChangeCounter, setCategoriesChangeCounter] = useState(0);

    // Use the custom hook to get categories
    const { categories, isLoading: categoriesLoading } = useCategories();

    // Regenerate habits when categories change
    const forceHabitsReload = () => {
        setCategoriesChangeCounter(prev => prev + 1);
        console.log("Forcing habits reload due to category changes");
    };

    // Use the custom hook to get habits data and functions
    // Pass categoriesChangeCounter as a dependency to force re-fetch
    const {
        habits,
        isLoading: habitsLoading,
        error,
        toggleCompletion
    } = useHabits(selectedCategory || undefined, categoriesChangeCounter);

    // Add an effect that depends on categoriesChangeCounter to force a refresh
    useEffect(() => {
        if (categoriesChangeCounter > 0) {
            // The actual refresh is handled by useHabits internally
        }
    }, [categoriesChangeCounter]);

    // Format categories for the CategoryFilter component from the data from Firebase
    const formattedCategories = categories.map(category => ({
        id: category.id,
        name: category.name,
        color: category.color
    }));

    useEffect(() => {
        // Redirect to home if not authenticated
        if (!user) {
            router.push("/");
        }
        // Redirect to verify email if not verified
        else if (!user.emailVerified) {
            router.push("/verify-email");
        }
    }, [user, router]);

    // Calculate completion percentage using data from Firebase
    useEffect(() => {
        if (habits.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Check if each habit has been completed for today
            const completedCount = habits.filter(habit =>
                habit.completedDates?.some(date => {
                    const completedDate = date instanceof Date ? date : date.toDate();
                    return isSameDay(completedDate, today);
                })
            ).length;

            setCompletionPercentage(Math.round((completedCount / habits.length) * 100));
        } else {
            setCompletionPercentage(0);
        }
    }, [habits]);

    const handleToggleComplete = (habitId: string) => {
        // Only allow marking habits as completed on the current day
        const today = new Date();

        if (!isSameDay(selectedDate, today)) {
            toast.warning("Habits can only be marked as completed for the current day");
            return;
        }

        // Use the toggleCompletion function from useHabits
        toggleCompletion(habitId, today)
            .catch(() => {
                // Error handling and toast is in the action
            });
    };

    const handleManageCategories = () => {
        console.log("handleManageCategories called - setting isCategoryModalOpen to true");
        setIsCategoryModalOpen(true);
        console.log("Current isCategoryModalOpen value:", isCategoryModalOpen);
    };

    const handleCategoriesChange = () => {
        // Force reload of habits when categories change
        forceHabitsReload();
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    if (!user) {
        return null; // Will redirect in useEffect
    }

    // Show loading while initializing or fetching habits
    if (initialLoading || habitsLoading || categoriesLoading) {
        return <LoadingScreen />;
    }

    // Show error message if there was an error fetching habits
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f9ef]">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Habits</h2>
                    <p className="text-gray-700">{error}</p>
                    <button
                        className="mt-4 bg-[#E50046] text-white px-4 py-2 rounded-md"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Map habits from Firebase to the format expected by HabitList
    const formattedHabits = habits.map(habit => {
        // Check if habit is completed for the selected date
        const isCompletedForSelectedDate = habit.completedDates?.some(date => {
            const completedDate = date instanceof Date ? date : date.toDate();
            return isSameDay(completedDate, selectedDate);
        }) || false;

        // Calculate streak based on consecutive completed days
        // You would implement more sophisticated streak calculation in a production app
        const streak = habit.completedDates?.length || 0;

        // Use the denormalized category color if available, otherwise find it
        // This approach uses the denormalized data first for better performance
        let categoryColor = habit.categoryColor;
        if (!categoryColor) {
            // Fallback to finding the category if denormalized data isn't available
            const habitCategory = categories.find(cat => cat.id === habit.category);
            categoryColor = habitCategory?.color || "#E50046"; // Default color if category not found
        }

        return {
            id: habit.id,
            name: habit.name,
            completed: isCompletedForSelectedDate,
            color: categoryColor, // Use the category color from denormalized data or lookup
            category: habit.category,
            categoryName: habit.categoryName, // Use denormalized category name
            streak: streak > 0 ? streak : undefined,
            icon: habit.icon || "🏃" // Add icon property
        };
    });

    // Debug logs
    console.log("Dashboard rendering with isCategoryModalOpen:", isCategoryModalOpen);

    return (
        <PageTransition>
            <div className="min-h-screen bg-[#f8f9ef] flex flex-col">
                {/* Mobile Header - only visible on small screens */}
                <MobileHeader
                    onMenuToggle={toggleMobileMenu}
                    isMenuOpen={isMobileMenuOpen}
                />

                <div className="flex flex-1 relative">
                    {/* Mobile Menu Overlay */}
                    {isMobileMenuOpen && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                            onClick={toggleMobileMenu}
                        />
                    )}

                 

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col">
                        {/* Desktop Header */}
                        {/* <DashboardHeader /> */}

                        {/* Dashboard Content */}
                        <main className="flex-1 p-4 md:p-6 overflow-auto">
                            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Main Content Area - Habits List */}
                                <div className="lg:col-span-8 space-y-6">
                                    {/* Category Filters */}
                                    <div className="bg-white rounded-lg shadow p-4">
                                        <CategoryFilter
                                            categories={formattedCategories}
                                            selectedCategory={selectedCategory}
                                            onSelectCategory={setSelectedCategory}
                                            onManageCategories={handleManageCategories}
                                        />
                                    </div>

                                    {/* Habits List */}
                                    <div className="bg-white rounded-lg shadow p-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-semibold">Habits</h3>
                                            <AddHabitButton buttonText="Create New Habit" />
                                        </div>
                                        <HabitList
                                            habits={formattedHabits}
                                            selectedDate={selectedDate}
                                            onToggleComplete={handleToggleComplete}
                                        />
                                    </div>
                                </div>

                                {/* Right Sidebar */}
                                <div className="lg:col-span-4 space-y-6">
                                    {/* Today's Progress */}
                                    <div className="bg-white rounded-lg shadow p-4">
                                        <h3 className="font-semibold mb-4">Today&apos;s Progress</h3>
                                        <ProgressCircle
                                            percentage={completionPercentage}
                                            label="of habits completed"
                                        />
                                    </div>

                                    {/* Calendar */}
                                    <div className="bg-white rounded-lg shadow p-4">
                                        <CalendarWidget onDateSelect={handleDateSelect} />
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>

                {/* Category Management Modal */}
                <CategoryModal
                    isOpen={isCategoryModalOpen}
                    onClose={() => {
                        console.log("Modal close called");
                        setIsCategoryModalOpen(false);
                    }}
                    onCategoryChange={handleCategoriesChange}
                />
            </div>
        </PageTransition>
    );
}
