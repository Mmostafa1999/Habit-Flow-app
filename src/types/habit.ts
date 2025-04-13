import { Timestamp } from "firebase/firestore";

export interface Habit {
  id: string;
  userId: string;
  name: string;
  category: string;
  categoryName?: string;
  categoryColor?: string;
  frequency: "daily" | "weekly" | "monthly";
  targetDays: number;
  completedDates: Timestamp[];
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  color?: string;
  icon?: string;
  isCompleted?: boolean;
  weeklyDays?: string[];
}

export interface HabitStats {
  habitId: string;
  name: string;
  completedCount: number;
  totalDays: number;
  completionRate: number;
}
