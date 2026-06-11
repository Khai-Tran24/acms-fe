import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "../../ui/calendar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../../ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";

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
        <InputGroup>
          <InputGroupAddon>
            <CalendarIcon />
          </InputGroupAddon>
          <InputGroupInput
            type="string"
            placeholder={placeholder || "DD-MM-YYYY"}
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </InputGroup>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={date ? new Date(date) : undefined}
          onSelect={(selectedDate) => {
            if (selectedDate) {
              onDateChange(selectedDate.toISOString().split("T")[0]);
            }
          }}
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  );
};
