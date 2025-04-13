import { Habit } from "@/types/habit";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

// Collection reference
const habitsCollection = collection(db, "habits");

// Create a new habit
export const createHabit = async (habit: Omit<Habit, "id">) => {
  try {
    const docRef = await addDoc(habitsCollection, {
      ...habit,
      createdAt: Timestamp.now(),
      completedDates: [],
    });
    return { id: docRef.id, ...habit };
  } catch (error) {
    console.error("Error creating habit:", error);
    throw error;
  }
};

// Get all habits for a user
export const getHabits = async (userId: string) => {
  try {
    const q = query(
      habitsCollection,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Habit[];
  } catch (error) {
    console.error("Error getting habits:", error);
    throw error;
  }
};

// Get habits for a specific date
export const getHabitsForDate = async (userId: string, date: Date) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      habitsCollection,
      where("userId", "==", userId),
      where("completedDates", "array-contains", Timestamp.fromDate(startOfDay)),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Habit[];
  } catch (error) {
    console.error("Error getting habits for date:", error);
    throw error;
  }
};

// Update a habit
export const updateHabit = async (habitId: string, updates: Partial<Habit>) => {
  try {
    const habitRef = doc(db, "habits", habitId);
    await updateDoc(habitRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating habit:", error);
    throw error;
  }
};

// Mark a habit as completed for a specific date
export const markHabitCompleted = async (habitId: string, date: Date) => {
  try {
    const habitRef = doc(db, "habits", habitId);
    const timestamp = Timestamp.fromDate(date);
    await updateDoc(habitRef, {
      completedDates: arrayUnion(timestamp),
    });
  } catch (error) {
    console.error("Error marking habit as completed:", error);
    throw error;
  }
};

// Helper function to normalize a date to start of day
const normalizeDate = (date: Date): Date => {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
};

// Helper function to check if two dates are the same day
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// Helper function to check if a habit is completed for a specific date
const isHabitCompletedForDate = (habit: Habit, date: Date): boolean => {
  const normalizedDate = normalizeDate(date);
  return (
    habit.completedDates?.some(completedDate => {
      const completedDateTime = completedDate.toDate();
      return isSameDay(completedDateTime, normalizedDate);
    }) || false
  );
};

// Helper function to find timestamps from the same day
const findTimestampsForDay = (habit: Habit, date: Date): Timestamp[] => {
  const normalizedDate = normalizeDate(date);
  return habit.completedDates.filter(completedDate => {
    const completedDateTime = completedDate.toDate();
    return isSameDay(completedDateTime, normalizedDate);
  });
};

// Toggle a habit completion status for a specific date
export const toggleHabitCompletion = async (habitId: string, date: Date) => {
  try {
    // Get the habit to check if it's already completed for this date
    const habitRef = doc(db, "habits", habitId);
    const habitDoc = await getDoc(habitRef);

    if (!habitDoc.exists()) {
      throw new Error("Habit not found");
    }

    const habitData = habitDoc.data() as Habit;

    // Normalize the date to start of day to ensure consistent comparison
    const normalizedDate = normalizeDate(date);
    const timestamp = Timestamp.fromDate(normalizedDate);

    // Check if the habit is already completed for this day
    const isAlreadyCompleted = isHabitCompletedForDate(
      habitData,
      normalizedDate,
    );

    if (isAlreadyCompleted) {
      // Find all timestamps from the same day to remove them
      const timestampsToRemove = findTimestampsForDay(
        habitData,
        normalizedDate,
      );

      // Remove all timestamps for the current day
      for (const timeToRemove of timestampsToRemove) {
        await updateDoc(habitRef, {
          completedDates: arrayRemove(timeToRemove),
        });
      }
    } else {
      // If not completed, add the normalized timestamp
      await updateDoc(habitRef, {
        completedDates: arrayUnion(timestamp),
      });
    }

    return !isAlreadyCompleted; // Return the new completion state
  } catch (error) {
    console.error("Error toggling habit completion:", error);
    throw error;
  }
};

// Delete a habit
export const deleteHabit = async (habitId: string) => {
  try {
    const habitRef = doc(db, "habits", habitId);
    await deleteDoc(habitRef);
  } catch (error) {
    console.error("Error deleting habit:", error);
    throw error;
  }
};

// Get habit statistics
export const getHabitStats = async (userId: string) => {
  try {
    const habits = await getHabits(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return habits.map(habit => {
      const completedCount = habit.completedDates.filter(
        date => date.toDate().getTime() === today.getTime(),
      ).length;
      const totalDays = Math.ceil(
        (today.getTime() - habit.createdAt.toDate().getTime()) /
          (1000 * 60 * 60 * 24),
      );
      const completionRate =
        totalDays > 0 ? (completedCount / totalDays) * 100 : 0;

      return {
        habitId: habit.id,
        name: habit.name,
        completedCount,
        totalDays,
        completionRate,
      };
    });
  } catch (error) {
    console.error("Error getting habit stats:", error);
    throw error;
  }
};

// Update all habits for a specific category when the category changes
export const updateHabitsForCategoryChange = async (
  categoryId: string,
  newCategoryName: string,
  newCategoryColor: string,
  userId: string,
) => {
  try {
    // Create query with both category and userId constraints for security
    const q = query(
      habitsCollection,
      where("category", "==", categoryId),
      where("userId", "==", userId),
    );

    const querySnapshot = await getDocs(q);

    // Update each habit with the new category information
    const updatePromises = querySnapshot.docs.map(doc => {
      const habitRef = doc.ref;
      return updateDoc(habitRef, {
        categoryName: newCategoryName,
        categoryColor: newCategoryColor,
        updatedAt: Timestamp.now(),
      });
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    console.log(
      `Updated ${updatePromises.length} habits with new category information`,
    );
  } catch (error) {
    console.error("Error updating habits for category change:", error);
    throw error;
  }
};
