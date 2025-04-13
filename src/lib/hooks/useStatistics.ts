import { db } from "@/lib/firebase/firebase";
import { Habit } from "@/types/habit";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

// Define types for statistics data
export interface HabitCompletion {
  id: string;
  name: string;
  category: string;
  categoryName?: string;
  completedCount: number;
  totalPossibleDays: number;
  completionRate: number;
  streak: number;
  longestStreak: number;
  icon?: string;
  color?: string;
}

export interface CategoryStatistics {
  id: string;
  name: string;
  color: string;
  habitCount: number;
  completedCount: number;
  totalPossibleCount: number;
  completionRate: number;
}

export interface StatisticsData {
  totalHabits: number;
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
  overallCompletionRate: number;
  habitCompletions: HabitCompletion[];
  categoryStatistics: CategoryStatistics[];
  lastUpdated: Date;
}

// Function to calculate dates between two dates
const getDaysBetweenDates = (startDate: Date, endDate: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const diffDays = Math.round(
    Math.abs((startDate.getTime() - endDate.getTime()) / oneDay),
  );
  return diffDays + 1; // Include both start and end dates
};

// Function to check if two dates are the same day
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// Helper function to calculate streak information
const calculateStreakInfo = (
  completedDates: Date[],
): { currentStreak: number; longestStreak: number } => {
  if (!completedDates.length) return { currentStreak: 0, longestStreak: 0 };

  // Sort dates ascending
  const sortedDates = [...completedDates].sort(
    (a, b) => a.getTime() - b.getTime(),
  );

  // Remove duplicates (same day)
  const uniqueDates: Date[] = [];
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0 || !isSameDay(sortedDates[i], sortedDates[i - 1])) {
      uniqueDates.push(sortedDates[i]);
    }
  }

  // Calculate longest streak
  let longestStreak = 1;
  let currentStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1]);
    prevDate.setDate(prevDate.getDate() + 1);

    if (isSameDay(prevDate, uniqueDates[i])) {
      tempStreak++;
    } else {
      tempStreak = 1;
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  // Calculate current streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (uniqueDates.length > 0) {
    const lastCompletedDate = new Date(uniqueDates[uniqueDates.length - 1]);
    lastCompletedDate.setHours(0, 0, 0, 0);

    if (isSameDay(lastCompletedDate, today)) {
      // Last completion was today, check for streak
      currentStreak = 1;
      for (let i = uniqueDates.length - 2; i >= 0; i--) {
        const expectDate = new Date(today);
        expectDate.setDate(expectDate.getDate() - currentStreak);

        const completedDate = new Date(uniqueDates[i]);
        completedDate.setHours(0, 0, 0, 0);

        if (isSameDay(expectDate, completedDate)) {
          currentStreak++;
        } else {
          break;
        }
      }
    } else {
      // Last completion wasn't today
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (isSameDay(lastCompletedDate, yesterday)) {
        // Last completion was yesterday, check for streak
        currentStreak = 1;
        for (let i = uniqueDates.length - 2; i >= 0; i--) {
          const expectDate = new Date(yesterday);
          expectDate.setDate(expectDate.getDate() - currentStreak);

          const completedDate = new Date(uniqueDates[i]);
          completedDate.setHours(0, 0, 0, 0);

          if (isSameDay(expectDate, completedDate)) {
            currentStreak++;
          } else {
            break;
          }
        }
      } else {
        // Streak broken
        currentStreak = 0;
      }
    }
  } else {
    currentStreak = 0;
  }

  return { currentStreak, longestStreak };
};

export function useStatistics() {
  const { user } = useAuth();
  const [data, setData] = useState<StatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when user changes
    if (!user) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const fetchStatistics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Fetch all user habits
        const habitsQuery = query(
          collection(db, "habits"),
          where("userId", "==", user.uid),
        );

        const habitsSnapshot = await getDocs(habitsQuery);
        const habits: Habit[] = habitsSnapshot.docs.map(
          doc =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Habit,
        );

        // 2. Calculate statistics
        const habitCompletions: HabitCompletion[] = [];
        const categoryMap = new Map<string, CategoryStatistics>();
        let totalCompletions = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Calculate total streak information across all habits
        const allCompletedDates: Date[] = [];

        habits.forEach(habit => {
          // Convert Timestamps to Dates for each habit
          const completedDates = (habit.completedDates || []).map(timestamp =>
            timestamp instanceof Date ? timestamp : timestamp.toDate(),
          );

          // Add to overall completed dates list
          allCompletedDates.push(...completedDates);

          // Calculate days since habit creation
          const creationDate =
            habit.createdAt instanceof Date
              ? habit.createdAt
              : habit.createdAt.toDate();

          // Calculate total possible days based on frequency and creation date
          let totalPossibleDays = getDaysBetweenDates(creationDate, today);

          if (
            habit.frequency === "weekly" &&
            habit.weeklyDays &&
            habit.weeklyDays.length > 0
          ) {
            // For weekly habits, only count days that match the selected weekdays
            const weekDayMap: { [key: string]: number } = {
              sun: 0,
              mon: 1,
              tue: 2,
              wed: 3,
              thu: 4,
              fri: 5,
              sat: 6,
            };

            const selectedDays = habit.weeklyDays.map(
              day => weekDayMap[day.toLowerCase()],
            );
            let matchingDays = 0;

            for (
              let d = new Date(creationDate);
              d <= today;
              d.setDate(d.getDate() + 1)
            ) {
              if (selectedDays.includes(d.getDay())) {
                matchingDays++;
              }
            }

            totalPossibleDays = matchingDays;
          }

          // Calculate streak information for this habit
          const { currentStreak, longestStreak } =
            calculateStreakInfo(completedDates);

          // Calculate completion rate
          const completedCount = completedDates.length;
          totalCompletions += completedCount;
          const completionRate =
            totalPossibleDays > 0
              ? (completedCount / totalPossibleDays) * 100
              : 0;

          // Add habit completion data
          habitCompletions.push({
            id: habit.id,
            name: habit.name,
            category: habit.category,
            categoryName: habit.categoryName || habit.category,
            completedCount,
            totalPossibleDays,
            completionRate,
            streak: currentStreak,
            longestStreak,
            icon: habit.icon,
            color: habit.color,
          });

          // Aggregate by category
          const categoryKey = habit.category;
          if (!categoryMap.has(categoryKey)) {
            categoryMap.set(categoryKey, {
              id: categoryKey,
              name: habit.categoryName || categoryKey,
              color: habit.categoryColor || habit.color || "#E50046", // Default pink color
              habitCount: 0,
              completedCount: 0,
              totalPossibleCount: 0,
              completionRate: 0,
            });
          }

          const categoryStats = categoryMap.get(categoryKey)!;
          categoryStats.habitCount += 1;
          categoryStats.completedCount += completedCount;
          categoryStats.totalPossibleCount += totalPossibleDays;

          // Update the map
          categoryMap.set(categoryKey, categoryStats);
        });

        // Calculate global streak information
        const { currentStreak, longestStreak } =
          calculateStreakInfo(allCompletedDates);

        // Calculate category completion rates
        const categoryStatistics = Array.from(categoryMap.values()).map(
          category => {
            return {
              ...category,
              completionRate:
                category.totalPossibleCount > 0
                  ? (category.completedCount / category.totalPossibleCount) *
                    100
                  : 0,
            };
          },
        );

        // Sort habit completions by completion rate (descending)
        habitCompletions.sort((a, b) => b.completionRate - a.completionRate);

        // Sort categories by completion rate (descending)
        categoryStatistics.sort((a, b) => b.completionRate - a.completionRate);

        // Calculate overall completion rate
        const totalPossibleDays = habits.reduce((sum, habit) => {
          const creationDate =
            habit.createdAt instanceof Date
              ? habit.createdAt
              : habit.createdAt.toDate();
          return sum + getDaysBetweenDates(creationDate, today);
        }, 0);

        const overallCompletionRate =
          totalPossibleDays > 0
            ? (totalCompletions / totalPossibleDays) * 100
            : 0;

        // Set the complete statistics data
        setData({
          totalHabits: habits.length,
          totalCompletions,
          currentStreak,
          longestStreak,
          overallCompletionRate,
          habitCompletions,
          categoryStatistics,
          lastUpdated: new Date(),
        });
      } catch (err) {
        console.error("Error fetching statistics:", err);
        setError("Failed to load statistics data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, [user]);

  return {
    data,
    isLoading,
    error,
    refetch: () => {
      if (user) {
        setIsLoading(true);
        // The useEffect will re-run with the next render
      }
    },
  };
}
