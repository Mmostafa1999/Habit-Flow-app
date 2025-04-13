import {
  addCategory as addCategoryAction,
  deleteCategory as deleteCategoryAction,
  editCategory,
  generateRandomColor,
} from "@/lib/actions/categoryActions";
import { db } from "@/lib/firebase/firebase";
import {
  Category,
  CategoryFormData,
  CategoryUpdateData,
} from "@/types/category";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";

export const useCategories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Fetch categories
  useEffect(() => {
    if (!user) {
      setCategories([]);
      setStatus("idle");
      setError(null);
      setIsSubscribed(false);
      return;
    }

    setStatus("loading");

    try {
      const q = query(
        collection(db, "categories"),
        where("userId", "==", user.uid),
        orderBy("name", "asc"),
      );

      const unsubscribe = onSnapshot(
        q,
        snapshot => {
          const categoriesData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt,
            } as Category;
          });

          setCategories(categoriesData);
          setStatus("idle");
          setError(null);
          setIsSubscribed(true);
        },
        error => {
          console.error("Categories fetch error:", error);
          setStatus("error");
          setError("Failed to load categories");
          setIsSubscribed(false);
        },
      );

      // Cleanup function to unsubscribe from Firestore listener
      return () => {
        unsubscribe();
        setIsSubscribed(false);
      };
    } catch (error) {
      console.error("Error setting up categories listener:", error);
      setStatus("error");
      setError("Failed to set up categories listener");
      setIsSubscribed(false);
    }
  }, [user]);

  // Add a new category
  const addCategory = useCallback(
    async (categoryData: CategoryFormData) => {
      if (!user) throw new Error("Authentication required");

      // Generate random color if not provided
      if (!categoryData.color) {
        categoryData.color = generateRandomColor();
      }

      return addCategoryAction(categoryData, user.uid);
    },
    [user],
  );

  // Update an existing category
  const updateCategory = useCallback(
    async (categoryId: string, updates: CategoryUpdateData) => {
      if (!user) throw new Error("Authentication required");

      // We need to add the user ID for security checks when updating habits
      const category = categories.find(c => c.id === categoryId);
      if (!category) {
        throw new Error("Category not found");
      }

      return editCategory(categoryId, updates);
    },
    [user, categories],
  );

  // Delete a category
  const removeCategory = useCallback(
    async (categoryId: string) => {
      if (!user) throw new Error("Authentication required");
      return deleteCategoryAction(categoryId);
    },
    [user],
  );

  // Get a formatted list of categories for UI display
  const getFormattedCategories = useCallback(() => {
    return categories.map(category => ({
      id: category.id,
      name: category.name,
      color: category.color,
    }));
  }, [categories]);

  // Get an individual category by ID
  const getCategoryById = useCallback(
    (id: string) => {
      return categories.find(category => category.id === id) || null;
    },
    [categories],
  );

  return {
    categories,
    isLoading: status === "loading",
    error,
    isSubscribed,
    addCategory,
    updateCategory,
    removeCategory,
    getFormattedCategories,
    getCategoryById,
  };
};
