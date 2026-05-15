"use client";

import { useMemo } from "react";
import { format, startOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

interface BookingDatePickerProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void;
  localeCode: string;
  unavailableDates?: string[];
  unavailableHint?: string;
}

function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export default function BookingDatePicker({
  selectedDate,
  onSelectDate,
  localeCode,
  unavailableDates = [],
  unavailableHint,
}: BookingDatePickerProps) {
  const today = startOfDay(new Date());

  const unavailableDateSet = useMemo(
    () => new Set(unavailableDates),
    [unavailableDates]
  );

  return (
    <div
      className="rounded-xl border border-border bg-card text-card-foreground"
      aria-label="Booking date picker"
      data-testid="booking-date-picker"
    >
      <Calendar
        mode="single"
        selected={selectedDate ?? undefined}
        onSelect={(value) => onSelectDate(value ?? null)}
        modifiers={{
          unavailable: (date) => unavailableDateSet.has(format(date, "yyyy-MM-dd")),
        }}
        modifiersClassNames={{
          unavailable: "line-through text-muted-foreground opacity-60",
        }}
        disabled={(date) => {
          if (date < today) return true;
          const dateKey = format(date, "yyyy-MM-dd");
          return unavailableDateSet.has(dateKey);
        }}
        classNames={{
          months: "w-full",
          month: "w-full",
          month_grid: "w-full",
          weekday: "w-[14.285%] text-center",
          week: "w-full",
          day: "w-[14.285%] h-10",
          day_button: "h-9 w-9 rounded-md mx-auto",
        }}
        formatters={{
          formatWeekdayName: (date) =>
            date.toLocaleDateString(localeCode, { weekday: "short" }),
          formatCaption: (date) =>
            date.toLocaleDateString(localeCode, { month: "long", year: "numeric" }),
        }}
      />
      {unavailableDates.length > 0 && unavailableHint && (
        <p className="px-4 pb-4 text-xs text-muted-foreground">
          {unavailableHint}
        </p>
      )}
    </div>
  );
}

export { parseIsoDate };
