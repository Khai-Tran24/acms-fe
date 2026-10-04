"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "../../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { format, isValid, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { formatDate } from "@/lib/helper/date-formatter.helper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CalendarInputProps {
  id?: string;
  date: string;
  onDateChange: (date: string) => void;
  placeholder?: string;
  enableTime?: boolean;
  disabled?: boolean;
}

export const CalendarInput = ({
  id,
  date,
  onDateChange,
  placeholder,
  enableTime = false,
  disabled = false,
}: CalendarInputProps) => {
  const parsed = date ? parseISO(date) : undefined;
  const selected = parsed && isValid(parsed) ? parsed : undefined;
  const hours = selected ? format(selected, "HH") : "00";
  const minutes = selected ? format(selected, "mm") : "00";

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    onDateChange(enableTime ? `${dateStr}T${hours}:${minutes}` : dateStr);
  };

  const handleTimeChange = (value: string, unit: "hours" | "minutes") => {
    if (!selected) return;
    const number = Number(value);
    const maximum = unit === "hours" ? 23 : 59;
    if (!Number.isInteger(number) || number < 0 || number > maximum) return;
    const time = String(number).padStart(2, "0");
    onDateChange(
      `${format(selected, "yyyy-MM-dd")}T${unit === "hours" ? time : hours}:${unit === "minutes" ? time : minutes}`,
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className="w-full justify-start"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected
            ? formatDate(selected, enableTime)
            : placeholder || (enableTime ? "dd/mm/yyyy hh:mm" : "dd/mm/yyyy")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3">
        <Calendar
          mode="single"
          locale={vi}
          captionLayout="dropdown"
          selected={selected}
          defaultMonth={selected}
          endMonth={new Date(2100, 11)}
          onSelect={handleDateSelect}
        />
        {enableTime && (
          <div className="mt-4 flex gap-2 border-t pt-3">
            <label className="flex flex-1 flex-col gap-1 text-xs font-semibold">
              Giờ
              <Input
                type="number"
                min="0"
                max="23"
                disabled={!selected}
                value={hours}
                onChange={(e) => handleTimeChange(e.target.value, "hours")}
                className="h-8 text-center"
              />
            </label>
            <div className="self-end text-xl font-bold">:</div>
            <label className="flex flex-1 flex-col gap-1 text-xs font-semibold">
              Phút
              <Input
                type="number"
                min="0"
                max="59"
                disabled={!selected}
                value={minutes}
                onChange={(e) => handleTimeChange(e.target.value, "minutes")}
                className="h-8 text-center"
              />
            </label>
          </div>
        )}
        {date && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDateChange("")}
          >
            Xóa ngày
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
};
