import {
  addHabit as addHabitAction,
  deleteHabit as deleteHabitAction,
  editHabit,
  HabitFormData,
  HabitUpdateData,
  toggleHabitCompletionStatus,
} from "@/lib/actions/habitActions";
import { db } from "@/lib/firebase/firebase";
import { Habit } from "@/types/habit";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "./useAuth";

export const useHabits = (category?: string, forceRefresh?: number) => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const queryConstraints = useMemo(
    () => [
      where("userId", "==", user?.uid ?? ""),
      ...(category && typeof category === "string" && category.trim() !== ""
        ? [where("category", "==", category)]
        : []),
    ],
    [user?.uid, category],
  );

  useEffect(() => {
    if (!user) {
      setHabits([]);
      setStatus("idle");
      setError(null);
      setIsSubscribed(false);
      return;
    }

    setStatus("loading");

    try {
      const q = query(collection(db, "habits"), ...queryConstraints);

      const unsubscribe = onSnapshot(
        q,
        snapshot => {
          const habitsData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt,
              completedDates: data.completedDates || [],
            } as Habit;
          });

          setHabits(habitsData);
          setStatus("idle");
          setError(null);
          setIsSubscribed(true);
        },
        error => {
          console.error("Habits fetch error:", error);
          setStatus("error");
          setError("Failed to load habits");
          setIsSubscribed(false);
        },
      );

      return () => {
        unsubscribe();
        setIsSubscribed(false);
      };
    } catch (error) {
      console.error("Error setting up habits listener:", error);
      setStatus("error");
      setError("Failed to set up habits listener");
      setIsSubscribed(false);
    }
  }, [queryConstraints, user, forceRefresh]);

  // Add a new habit using the action
  const addHabit = useCallback(
    async (habitData: HabitFormData) => {
      if (!user) throw new Error("Authentication required");
      return addHabitAction(habitData, user.uid);
    },
    [user],
  );

  // Update an existing habit using the action
  const updateHabit = useCallback(
    async (habitId: string, updates: HabitUpdateData) => {
      try {
        return editHabit(habitId, updates);
      } catch (error) {
        setError("Failed to update habit");
        throw error;
      }
    },
    [],
  );

  // Delete a habit using the action
  const removeHabit = useCallback(
    async (habitId: string) => {
      if (!user) throw new Error("Authentication required");
      return deleteHabitAction(habitId);
    },
    [user],
  );

  // Toggle habit completion status using the action
  const toggleCompletion = useCallback(
    async (habitId: string, date: Date) => {
      if (!user) throw new Error("Authentication required");
      return toggleHabitCompletionStatus(habitId, date);
    },
    [user],
  );

  return {
    habits,
    isLoading: status === "loading",
    error: error ? error : null,
    isSubscribed,
    addHabit,
    updateHabit,
    removeHabit,
    toggleCompletion,
  };
};
