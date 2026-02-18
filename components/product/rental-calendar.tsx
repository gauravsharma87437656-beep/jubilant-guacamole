"use client";

import { useState, useMemo } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    addMonths,
    subMonths,
    isSameMonth,
    isSameDay,
    isBefore,
    isAfter,
    isWithinInterval,
    startOfDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays, AlertCircle } from "lucide-react";

interface DateRange {
    startDate: string;
    endDate: string;
    reason?: string | null;
}

interface RentalCalendarProps {
    bookedDates: DateRange[];
    blockedDates: DateRange[];
    selectedDate: Date | null;
    rentalDays: number;
    onDateSelect: (date: Date) => void;
}

export function RentalCalendar({
    bookedDates,
    blockedDates,
    selectedDate,
    rentalDays,
    onDateSelect,
}: RentalCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const today = startOfDay(new Date());

    // Compute all unavailable dates (booked + blocked)
    const unavailableDates = useMemo(() => {
        const dates: { date: Date; reason: string }[] = [];

        // Process booked dates
        bookedDates.forEach((range) => {
            const start = startOfDay(new Date(range.startDate));
            const end = startOfDay(new Date(range.endDate));
            let current = start;
            while (!isAfter(current, end)) {
                dates.push({ date: current, reason: "Booked" });
                current = addDays(current, 1);
            }
        });

        // Process blocked dates
        blockedDates.forEach((range) => {
            const start = startOfDay(new Date(range.startDate));
            const end = startOfDay(new Date(range.endDate));
            let current = start;
            while (!isAfter(current, end)) {
                dates.push({ date: current, reason: range.reason || "Unavailable" });
                current = addDays(current, 1);
            }
        });

        return dates;
    }, [bookedDates, blockedDates]);

    // Check if a date is unavailable
    const isDateUnavailable = (date: Date): { unavailable: boolean; reason: string } => {
        const found = unavailableDates.find((d) => isSameDay(d.date, date));
        return found
            ? { unavailable: true, reason: found.reason }
            : { unavailable: false, reason: "" };
    };

    // Check if any date in the rental range is unavailable
    const isRangeConflicting = (startDate: Date): boolean => {
        for (let i = 0; i < rentalDays; i++) {
            const checkDate = addDays(startDate, i);
            if (isDateUnavailable(checkDate).unavailable) {
                return true;
            }
        }
        return false;
    };

    // Get the rental end date preview
    const rentalEndDate = selectedDate ? addDays(selectedDate, rentalDays - 1) : null;

    // Check if a date falls within selected rental range
    const isInRentalRange = (date: Date): boolean => {
        if (!selectedDate || !rentalEndDate) return false;
        return isWithinInterval(date, { start: selectedDate, end: rentalEndDate });
    };

    const handleDateClick = (date: Date) => {
        if (isBefore(date, today)) return;
        if (isDateUnavailable(date).unavailable) return;
        onDateSelect(date);
    };

    const renderMonth = (monthDate: Date) => {
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
        const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const rows: JSX.Element[] = [];
        let days: JSX.Element[] = [];
        let day = calStart;

        while (!isAfter(day, calEnd)) {
            for (let i = 0; i < 7; i++) {
                const currentDay = day;
                const isPast = isBefore(currentDay, today);
                const isCurrentMonth = isSameMonth(currentDay, monthDate);
                const isToday = isSameDay(currentDay, today);
                const { unavailable, reason } = isDateUnavailable(currentDay);
                const isSelected = selectedDate ? isSameDay(currentDay, selectedDate) : false;
                const inRange = isInRentalRange(currentDay);
                const isRangeStart = isSelected;
                const isRangeEnd = rentalEndDate ? isSameDay(currentDay, rentalEndDate) : false;

                let cellClass = "relative w-9 h-9 flex items-center justify-center text-sm rounded-lg transition-all duration-200 ";

                if (!isCurrentMonth) {
                    cellClass += "text-gray-300 cursor-default ";
                } else if (isPast) {
                    cellClass += "text-gray-300 cursor-not-allowed line-through ";
                } else if (unavailable) {
                    cellClass += "bg-red-100 text-red-500 cursor-not-allowed ";
                } else if (isRangeStart) {
                    cellClass += "bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-200 cursor-pointer ";
                } else if (isRangeEnd && inRange) {
                    cellClass += "bg-emerald-400 text-white font-semibold cursor-pointer ";
                } else if (inRange) {
                    cellClass += "bg-emerald-100 text-emerald-700 cursor-pointer ";
                } else if (isToday) {
                    cellClass += "border-2 border-emerald-400 font-semibold text-gray-900 cursor-pointer hover:bg-emerald-50 ";
                } else {
                    cellClass += "text-gray-700 cursor-pointer hover:bg-gray-100 ";
                }

                days.push(
                    <div key={day.toString()} className="relative group">
                        <button
                            onClick={() => handleDateClick(currentDay)}
                            disabled={isPast || !isCurrentMonth || unavailable}
                            className={cellClass}
                        >
                            {format(currentDay, "d")}
                        </button>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div key={day.toString()} className="grid grid-cols-7 gap-1">
                    {days}
                </div>
            );
            days = [];
        }

        return (
            <div>
                <div className="text-center font-semibold text-gray-800 mb-3 text-sm">
                    {format(monthDate, "MMMM yyyy")}
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                        <div key={d} className="w-9 h-7 flex items-center justify-center text-xs font-medium text-gray-400">
                            {d}
                        </div>
                    ))}
                </div>
                <div className="space-y-1">{rows}</div>
            </div>
        );
    };

    const hasConflict = selectedDate ? isRangeConflicting(selectedDate) : false;

    return (
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-gray-800">Select Rental Start Date</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-1.5 rounded-lg hover:bg-white/80 transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-1.5 rounded-lg hover:bg-white/80 transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
                <div>
                    {renderMonth(currentMonth)}
                </div>
            </div>

            {/* Legend & Info */}
            <div className="px-4 pb-3 space-y-2">
                <div className="flex flex-wrap gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                        <span className="text-gray-600">Start Date</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-200" />
                        <span className="text-gray-600">Rental Period</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-200" />
                        <span className="text-gray-600">Reserved</span>
                    </div>
                </div>

                {/* Selected date info */}
                {selectedDate && rentalEndDate && (
                    <div className={`flex items-start gap-2 p-2.5 rounded-lg text-xs ${hasConflict ? "bg-red-50 border border-red-200" : "bg-emerald-50 border border-emerald-200"}`}>
                        {hasConflict ? (
                            <>
                                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-red-700">
                                        Some dates in your rental period are unavailable.
                                    </p>
                                    <p className="text-red-600 mt-0.5">
                                        Please choose a different start date or reduce the rental duration.
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <CalendarDays className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-emerald-700">
                                        {format(selectedDate, "d MMM yyyy")} → {format(rentalEndDate, "d MMM yyyy")}
                                    </p>
                                    <p className="text-emerald-600 mt-0.5">
                                        {rentalDays} day{rentalDays > 1 ? "s" : ""} rental period
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
