import { format, isValid, parseISO } from "date-fns";

export const formatDate = (
  value?: string | Date | null,
  includeTime?: boolean,
) => {
  if (!value) return "Chưa cập nhật";
  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) return String(value);
  const withTime =
    includeTime ?? (value instanceof Date || /[T ]\d{2}:\d{2}/.test(value));
  return format(date, withTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy");
};

// Preserve local wall-clock time when editing an API timestamp.
export const toDateTimeInputValue = (value: string) => {
  const date = parseISO(value);
  return isValid(date) ? format(date, "yyyy-MM-dd'T'HH:mm") : "";
};
