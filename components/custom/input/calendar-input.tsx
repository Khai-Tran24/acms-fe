import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "../../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { formatDate } from "date-fns";
import { Button } from "@/components/ui/button";

interface CalendarInputProps {
  date: string;
  onDateChange: (date: string) => void;
  placeholder?: string;
}

export const CalendarInput = ({
  date,
  onDateChange,
  placeholder,
  ...calendarProps
}: CalendarInputProps) => {
  // ISO 8601 format: YYYY-MM-DD
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date
            ? formatDate(new Date(date), "dd-MM-yyyy")
            : placeholder || "Select date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={date ? new Date(date) : undefined}
          onSelect={(selectedDate) => {
            if (selectedDate) {
              onDateChange(formatDate(selectedDate, "yyyy-MM-dd"));
            }
          }}
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  );
};
