import React from 'react';

interface WeekDaySelectorProps {
    selectedDays: string[];
    onChange: (days: string[]) => void;
    error?: string;
    label?: string;
}

const DAYS_OF_WEEK = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

export function WeekDaySelector({
    selectedDays,
    onChange,
    error,
    label = "Days of Week"
}: WeekDaySelectorProps) {
    const handleDayToggle = (day: string) => {
        if (selectedDays.includes(day)) {
            onChange(selectedDays.filter(d => d !== day));
        } else {
            onChange([...selectedDays, day]);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>
            <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                    <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${selectedDays.includes(day)
                                ? "bg-pink-500 text-white border-pink-500"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        {day.slice(0, 3)}
                    </button>
                ))}
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
} 