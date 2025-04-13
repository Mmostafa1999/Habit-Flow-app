"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HabitForm from "../habits/HabitForm";
import { toast } from "react-toastify";
import { Habit as HabitType } from "@/types/habit";
import { useHabits } from "@/lib/hooks/useHabits";
import { HabitFormData } from "@/lib/actions/habitActions";
import ConfirmModal from "../common/ConfirmModal";

type Habit = {
  id: string;
  name: string;
  completed: boolean;
  color: string;
  category?: string;
  streak?: number;
  icon?: string;
  frequency?: "daily" | "weekly" | "monthly";
  targetDays?: number;
  weeklyDays?: string[];
};

interface HabitListProps {
  habits: Habit[];
  onToggleComplete: (habitId: string) => void;
  selectedDate?: Date;
}

// Utility function to check if two dates are the same day
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const HabitList: React.FC<HabitListProps> = ({
  habits,
  onToggleComplete,
  selectedDate = new Date(),
}) => {
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);
  const { updateHabit, removeHabit } = useHabits();

  // Check if selected date is today
  const today = new Date();
  const isToday = isSameDay(today, selectedDate);

  if (habits.length === 0) {
    return (
      <div className="text-center text-gray-500 py-6">
        No habits found for this category.
      </div>
    );
  }

  const handleEditClick = (habit: Habit) => {
    setEditingHabit(habit);
  };

  const handleCancelEdit = () => {
    setEditingHabit(null);
  };

  const handleDeleteClick = async (habitId: string) => {
    setHabitToDelete(habitId);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (habitToDelete) {
      setDeletingHabit(habitToDelete);
      try {
        await removeHabit(habitToDelete);
        // Toast is handled in the action
      } catch {
        // Error handling is in the action
      } finally {
        setDeletingHabit(null);
        setIsConfirmModalOpen(false);
        setHabitToDelete(null);
      }
    }
  };

  // TypeScript hack: define this function with the signature expected by HabitForm
  const handleSaveEdit: (data: Omit<HabitType, "id" | "userId" | "createdAt" | "completedDates">) => void =
    async (updatedData) => {
      if (!editingHabit) return;

      try {
        // Use the updateHabit from useHabits hook
        await updateHabit(editingHabit.id, updatedData as HabitFormData);
        // Toast is handled in the action
        setEditingHabit(null);
      } catch {
        // Error handling is in the action
      }
    };

  return (
    <>
      <div className="space-y-4">
        {!isToday && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <p className="text-yellow-700">
              You can only mark habits as completed for today's date.
            </p>
          </div>
        )}
        {habits.map((habit) => (
          <div
            key={habit.id}
            className="flex items-center justify-between p-3 rounded-lg border-l-4"
            style={{ borderLeftColor: habit.color }}
          >
            <div className="flex items-center space-x-4">
              {/* Custom checkbox */}
              <button
                onClick={() => onToggleComplete(habit.id)}
                className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors
                  ${!isToday ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                style={{
                  backgroundColor: habit.completed ? habit.color : 'transparent',
                  borderColor: habit.completed ? habit.color : '#ccc'
                }}
                disabled={!isToday}
                title={!isToday ? "Habits can only be completed for today" : ""}
              >
                {habit.completed && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="currentColor" />
                  </svg>
                )}
              </button>

              {/* Habit info */}
              <div>
                <h3
                  className={`text-lg font-medium ${habit.completed ? "line-through text-gray-400" : "text-gray-800"}`}
                >
                  <span className="mr-2">{habit.icon}</span>
                  {habit.name}
                </h3>
                <div className="text-xs text-gray-500 flex items-center mt-1">
                  {habit.category && (
                    <span className="px-2 py-1 bg-gray-100 rounded-full mr-2">
                      {habit.category}
                    </span>
                  )}
                  {habit.streak && habit.streak > 0 && (
                    <span className="flex items-center">
                      <span className="mr-1">🔥</span>
                      <span>{habit.streak} day streak</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleEditClick(habit)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Edit habit"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" />
                </svg>
              </button>
              <button
                onClick={() => handleDeleteClick(habit.id)}
                className="text-gray-400 hover:text-red-500"
                aria-label="Delete habit"
                disabled={deletingHabit === habit.id}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {editingHabit && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setEditingHabit(null);
              }
            }}
          >
            <div className="w-full max-w-lg">
              <HabitForm
                initialData={editingHabit}
                onSubmit={handleSaveEdit}
                onCancel={handleCancelEdit}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Habit"
        description="Are you sure you want to delete this habit? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

export default HabitList;
