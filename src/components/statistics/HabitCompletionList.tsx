import React from 'react';
import { HabitCompletion } from '@/lib/hooks/useStatistics';

interface HabitCompletionListProps {
  habits: HabitCompletion[];
}

export default function HabitCompletionList({ habits }: HabitCompletionListProps) {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-3">Habit Completion Rates</h3>
      
      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
        {habits.map(habit => (
          <div 
            key={habit.id} 
            className="bg-white rounded-lg p-3 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{habit.icon || '🏃'}</span>
              <div>
                <h4 className="font-medium text-gray-800">{habit.name}</h4>
                <p className="text-xs text-gray-500">{habit.categoryName}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Completion Rate</span>
              <span 
                className="text-sm font-semibold" 
                style={{ color: habit.color || '#E50046' }}
              >
                {Math.round(habit.completionRate)}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="h-2 rounded-full" 
                style={{ 
                  width: `${Math.round(habit.completionRate)}%`,
                  backgroundColor: habit.color || '#E50046'
                }}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-gray-500">Streak</p>
                <p className="font-medium">
                  {habit.streak} day{habit.streak !== 1 ? 's' : ''}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Longest Streak</p>
                <p className="font-medium">
                  {habit.longestStreak} day{habit.longestStreak !== 1 ? 's' : ''}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Completed</p>
                <p className="font-medium">{habit.completedCount} times</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Days</p>
                <p className="font-medium">{habit.totalPossibleDays}</p>
              </div>
            </div>
          </div>
        ))}
        
        {habits.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            No habits to display
          </div>
        )}
      </div>
    </div>
  );
} 