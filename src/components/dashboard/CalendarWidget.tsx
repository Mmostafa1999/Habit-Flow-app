"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarWidgetProps {
    onDateSelect?: (date: Date) => void;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ onDateSelect }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Get current month details
    const getMonthData = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();

        // First day of the month
        const firstDay = new Date(year, month, 1);
        // Last day of the month
        const lastDay = new Date(year, month + 1, 0);

        // Day of the week for the first day (0-6, 0 is Sunday)
        const startDayOfWeek = firstDay.getDay();

        // Total days in month
        const daysInMonth = lastDay.getDate();

        return { year, month, firstDay, lastDay, startDayOfWeek, daysInMonth };
    };

    const { year, month, startDayOfWeek, daysInMonth } = getMonthData(currentDate);

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    // Navigate to previous month
    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    // Navigate to next month
    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    // Handle date selection
    const handleDateClick = (day: number) => {
        const newDate = new Date(year, month, day);
        setSelectedDate(newDate);
        if (onDateSelect) {
            onDateSelect(newDate);
        }
    };

    // Generate calendar grid
    const renderCalendarDays = () => {
        const days = [];
        const today = new Date();

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = date.toDateString() === today.toDateString();
            const isSelected = date.toDateString() === selectedDate.toDateString();

            days.push(
                <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`
            h-8 w-8 rounded-full flex items-center justify-center text-sm
            ${isToday ? 'font-semibold' : ''}
            ${isSelected ? 'bg-[#E50046] text-white' : isToday ? 'border border-[#E50046] text-[#E50046]' : 'hover:bg-gray-100'}
          `}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    return (
        <div className="bg-white rounded-lg shadow p-4 w-full max-w-xs">
            <div className="flex justify-between items-center mb-4">
                <button onClick={prevMonth} className="p-1 rounded-full hover:bg-gray-100">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="font-semibold">
                    {monthNames[month]} {year}
                </h3>
                <button onClick={nextMonth} className="p-1 rounded-full hover:bg-gray-100">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {dayNames.map(day => (
                    <div key={day} className="text-xs font-medium text-gray-500">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {renderCalendarDays()}
            </div>
        </div>
    );
};

export default CalendarWidget; 