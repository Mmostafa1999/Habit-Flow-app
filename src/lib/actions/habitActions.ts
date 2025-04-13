import {
  createHabit as createHabitFirebase,
  deleteHabit as deleteHabitFirebase,
  toggleHabitCompletion,
  updateHabit as updateHabitFirebase,
  updateHabitsForCategoryChange,
} from "@/lib/firebase/habits";
import { Habit } from "@/types/habit";
import { Timestamp } from "firebase/firestore";
import { toast } from "react-toastify";

// Custom error class for habit operations
export class HabitActionError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = "HabitActionError";
  }
}

// Types
export type HabitFormData = Omit<
  Habit,
  | "id"
  | "userId"
  | "createdAt"
  | "completedDates"
  | "categoryName"
  | "categoryColor"
>;
export type HabitUpdateData = Partial<HabitFormData>;

// Interface for callback options
interface CallbackOptions {
  onSuccess?: () => void;
  onError?: (error: HabitActionError) => void;
}

/**
 * Creates a new habit
 * @param habitData - The data for the new habit
 * @param userId - The ID of the user creating the habit
 * @param options - Optional callbacks for success and error handling
 * @returns The created habit with its ID
 */
export const addHabit = async (
  habitData: HabitFormData,
  userId: string,
  options?: CallbackOptions,
): Promise<Habit> => {
  try {
    // Only include the habit data without trying to add undefined categoryName/Color
    const habitWithCategory = {
      ...habitData,
      userId,
    };

    // Create the habit in Firebase
    const newHabit = await createHabitFirebase({
      ...habitWithCategory,
      createdAt: Timestamp.now(),
      completedDates: [],
    });

    // Show success toast and call callback if provided
    toast.success("Habit created successfully!");
    options?.onSuccess?.();

    return newHabit as Habit;
  } catch (error) {
    // Handle errors
    console.error("Error creating habit:", error);
    const actionError = new HabitActionError(
      "Failed to create habit",
      error instanceof Error ? error.message : undefined,
      error,
    );

    // Show error toast and call error callback if provided
    toast.error(actionError.message);
    options?.onError?.(actionError);

    throw actionError;
  }
};

/**
 * Updates an existing habit
 * @param habitId - The ID of the habit to update
 * @param updates - The partial data to update
 * @param options - Optional callbacks for success and error handling
 */
export const editHabit = async (
  habitId: string,
  updates: HabitUpdateData,
  options?: CallbackOptions,
): Promise<void> => {
  try {
    // Update the habit in Firebase
    await updateHabitFirebase(habitId, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    // Show success toast and call callback if provided
    toast.success("Habit updated successfully!");
    options?.onSuccess?.();
  } catch (error) {
    // Handle errors
    console.error("Error updating habit:", error);
    const actionError = new HabitActionError(
      "Failed to update habit",
      error instanceof Error ? error.message : undefined,
      error,
    );

    // Show error toast and call error callback if provided
    toast.error(actionError.message);
    options?.onError?.(actionError);

    throw actionError;
  }
};

/**
 * Updates all habits that use a specific category with new category information
 * @param categoryId - The ID of the category that was updated
 * @param categoryName - The new name of the category
 * @param categoryColor - The new color of the category
 * @param userId - The ID of the user updating the habits
 * @param options - Optional callbacks for success and error handling
 */
export const updateHabitsForCategory = async (
  categoryId: string,
  categoryName: string,
  categoryColor: string,
  userId: string,
  options?: CallbackOptions,
): Promise<void> => {
  try {
    // Update all habits with the matching category ID
    await updateHabitsForCategoryChange(
      categoryId,
      categoryName,
      categoryColor,
      userId,
    );

    // Call success callback if provided
    options?.onSuccess?.();
  } catch (error) {
    // Handle errors
    console.error("Error updating habits for category change:", error);
    const actionError = new HabitActionError(
      "Failed to update habits with new category information",
      error instanceof Error ? error.message : undefined,
      error,
    );

    // Show error toast and call error callback if provided
    toast.error(actionError.message);
    options?.onError?.(actionError);

    throw actionError;
  }
};

/**
 * Deletes a habit
 * @param habitId - The ID of the habit to delete
 * @param options - Optional callbacks for success and error handling
 */
export const deleteHabit = async (
  habitId: string,
  options?: CallbackOptions,
): Promise<void> => {
  try {
    // Delete the habit from Firebase
    await deleteHabitFirebase(habitId);

    // Show success toast and call callback if provided
    toast.success("Habit deleted successfully!");
    options?.onSuccess?.();
  } catch (error) {
    // Handle errors
    console.error("Error deleting habit:", error);
    const actionError = new HabitActionError(
      "Failed to delete habit",
      error instanceof Error ? error.message : undefined,
      error,
    );

    // Show error toast and call error callback if provided
    toast.error(actionError.message);
    options?.onError?.(actionError);

    throw actionError;
  }
};

/**
 * Toggles a habit's completion status for a specific date
 * @param habitId - The ID of the habit
 * @param date - The date to toggle completion for
 * @param options - Optional callbacks for success and error handling
 */
export const toggleHabitCompletionStatus = async (
  habitId: string,
  date: Date,
  options?: CallbackOptions,
): Promise<void> => {
  try {
    // Toggle completion status in Firebase
    await toggleHabitCompletion(habitId, date);

    // Call success callback if provided (no toast for this one as it's a frequent action)
    options?.onSuccess?.();
  } catch (error) {
    // Handle errors
    console.error("Error toggling habit completion:", error);
    const actionError = new HabitActionError(
      "Failed to update habit completion status",
      error instanceof Error ? error.message : undefined,
      error,
    );

    // Show error toast and call error callback if provided
    toast.error(actionError.message);
    options?.onError?.(actionError);

    throw actionError;
  }
};
