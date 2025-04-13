import { updateHabitsForCategory } from "@/lib/actions/habitActions";
import {
  createCategory as createCategoryFirebase,
  deleteCategory as deleteCategoryFirebase,
  updateCategory as updateCategoryFirebase,
} from "@/lib/firebase/categories";
import { db } from "@/lib/firebase/firebase";
import {
  Category,
  CategoryFormData,
  CategoryUpdateData,
} from "@/types/category";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { toast } from "react-toastify";

// Custom error class for category operations
export class CategoryActionError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = "CategoryActionError";
  }
}

// Interface for callback options
interface CallbackOptions {
  onSuccess?: () => void;
  onError?: (error: CategoryActionError) => void;
}

// Utility function to generate a random color
export const generateRandomColor = (): string => {
  // Tailwind-friendly colors
  const colors = [
    "#2563EB", // blue-600
    "#7C3AED", // violet-600
    "#DB2777", // pink-600
    "#DC2626", // red-600
    "#D97706", // amber-600
    "#059669", // emerald-600
    "#0891B2", // cyan-600
    "#4F46E5", // indigo-600
    "#7E22CE", // purple-600
    "#BE185D", // pink-700
    "#B91C1C", // red-700
    "#B45309", // amber-700
    "#047857", // emerald-700
    "#0E7490", // cyan-700
  ];

  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Creates a new category
 * @param categoryData - The data for the new category
 * @param userId - The ID of the user creating the category
 * @param options - Optional callbacks for success and error handling
 * @returns The created category with its ID
 */
export const addCategory = async (
  categoryData: CategoryFormData,
  userId: string,
  options?: CallbackOptions,
): Promise<Category> => {
  try {
    // If no color is provided, generate a random one
    if (!categoryData.color) {
      categoryData.color = generateRandomColor();
    }

    // Create the category in Firebase
    const newCategory = await createCategoryFirebase({
      ...categoryData,
      userId,
    });

    // Show success toast and call callback if provided
    toast.success("Category created successfully!");
    options?.onSuccess?.();

    return newCategory as Category;
  } catch (error) {
    // Handle errors
    console.error("Error creating category:", error);
    const actionError = new CategoryActionError(
      "Failed to create category",
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
 * Updates an existing category
 * @param categoryId - The ID of the category to update
 * @param updates - The partial data to update
 * @param options - Optional callbacks for success and error handling
 */
export const editCategory = async (
  categoryId: string,
  updates: CategoryUpdateData,
  options?: CallbackOptions,
): Promise<void> => {
  try {
    // First, get the category to get its userId
    const categoryRef = doc(db, "categories", categoryId);
    const categorySnap = await getDoc(categoryRef);

    if (!categorySnap.exists()) {
      throw new Error("Category not found");
    }

    const categoryData = categorySnap.data();
    const userId = categoryData.userId;

    // Update the category in Firebase
    await updateCategoryFirebase(categoryId, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    // If name or color has changed, update all habits using this category
    if (updates.name || updates.color) {
      try {
        // We need to get the complete updated category data to pass to the habits
        const updatedName = updates.name;
        const updatedColor = updates.color;

        // Only update habits if we have both name and color
        if (updatedName && updatedColor) {
          // Pass the userId to satisfy security rules
          await updateHabitsForCategory(
            categoryId,
            updatedName,
            updatedColor,
            userId,
          );
        }
      } catch (error) {
        console.error("Error updating habits for category change:", error);
        // We don't throw here, as we still want to consider the category update a success
      }
    }

    // Show success toast and call callback if provided
    toast.success("Category updated successfully!");
    options?.onSuccess?.();
  } catch (error) {
    // Handle errors
    console.error("Error updating category:", error);
    const actionError = new CategoryActionError(
      "Failed to update category",
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
 * Deletes a category
 * @param categoryId - The ID of the category to delete
 * @param options - Optional callbacks for success and error handling
 */
export const deleteCategory = async (
  categoryId: string,
  options?: CallbackOptions,
): Promise<void> => {
  try {
    // Delete the category from Firebase
    await deleteCategoryFirebase(categoryId);

    // Show success toast and call callback if provided
    toast.success("Category deleted successfully!");
    options?.onSuccess?.();
  } catch (error) {
    // Handle errors
    console.error("Error deleting category:", error);
    const actionError = new CategoryActionError(
      "Failed to delete category",
      error instanceof Error ? error.message : undefined,
      error,
    );

    // Show error toast and call error callback if provided
    toast.error(actionError.message);
    options?.onError?.(actionError);

    throw actionError;
  }
};
