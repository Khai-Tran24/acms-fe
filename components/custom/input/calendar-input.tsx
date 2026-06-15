import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Calendar } from "../../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { formatDate } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface CalendarInputProps {
  date: string;
  onDateChange: (date: string) => void;
  placeholder?: string;
  enableTime?: boolean;
}

export const CalendarInput = ({
  date,
  onDateChange,
  placeholder,
  enableTime = false,
  ...calendarProps
}: CalendarInputProps) => {
  // ISO 8601 format: YYYY-MM-DD or YYYY-MM-DDTHH:mm when time is enabled
  const [hours, setHours] = useState(() => {
    if (!date || !enableTime) return "00";
    const time = date.split("T")[1]?.split(":")[0] || "00";
    return time;
  });

  const [minutes, setMinutes] = useState(() => {
    if (!date || !enableTime) return "00";
    const time = date.split("T")[1]?.split(":")[1] || "00";
    return time;
  });

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;

    if (enableTime) {
      const dateStr = formatDate(selectedDate, "yyyy-MM-dd");
      const timeStr = `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
      onDateChange(`${dateStr}T${timeStr}`);
    } else {
      onDateChange(formatDate(selectedDate, "yyyy-MM-dd"));
    }
  };

  const handleTimeChange = (newHours: string, newMinutes: string) => {
    setHours(newHours);
    setMinutes(newMinutes);

    // Update the date with new time
    if (date) {
      const dateStr = date.split("T")[0];
      const timeStr = `${newHours.padStart(2, "0")}:${newMinutes.padStart(2, "0")}`;
      onDateChange(`${dateStr}T${timeStr}`);
    }
  };

  const getDisplayText = () => {
    if (!date) return placeholder || "Select date";

    const dateStr = date.split("T")[0];
    if (enableTime && date.includes("T")) {
      const timeStr = date.split("T")[1];
      return `${formatDate(new Date(dateStr), "dd-MM-yyyy")} ${timeStr}`;
    }
    return formatDate(new Date(dateStr), "dd-MM-yyyy");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {getDisplayText()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={date ? new Date(date.split("T")[0]) : undefined}
          onSelect={handleDateSelect}
          {...calendarProps}
        />
        {enableTime && (
          <div className="mt-4 flex gap-2 border-t pt-3">
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs font-semibold">HH</label>
              <Input
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={(e) => handleTimeChange(e.target.value, minutes)}
                className="h-8 text-center"
                placeholder="00"
              />
            </div>
            <div className="text-xl font-bold">:</div>
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs font-semibold">MM</label>
              <Input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => handleTimeChange(hours, e.target.value)}
                className="h-8 text-center"
                placeholder="00"
              />
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
