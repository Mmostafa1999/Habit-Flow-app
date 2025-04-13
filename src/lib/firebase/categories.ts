import { Category } from "@/types/category";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

// Collection reference
const categoriesCollection = collection(db, "categories");

// Create a new category
export const createCategory = async (
  category: Omit<Category, "id" | "createdAt">,
) => {
  try {
    const docRef = await addDoc(categoriesCollection, {
      ...category,
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...category, createdAt: Timestamp.now() };
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

// Get all categories for a user
export const getCategories = async (userId: string) => {
  try {
    const q = query(
      categoriesCollection,
      where("userId", "==", userId),
      orderBy("name", "asc"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Category[];
  } catch (error) {
    console.error("Error getting categories:", error);
    throw error;
  }
};

// Update a category
export const updateCategory = async (
  categoryId: string,
  updates: Partial<Category>,
) => {
  try {
    const categoryRef = doc(db, "categories", categoryId);
    await updateDoc(categoryRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

// Delete a category
export const deleteCategory = async (categoryId: string) => {
  try {
    const categoryRef = doc(db, "categories", categoryId);
    await deleteDoc(categoryRef);
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};
