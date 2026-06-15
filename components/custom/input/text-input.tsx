/* eslint-disable @typescript-eslint/no-explicit-any */
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ComponentProps } from "react";
import { Controller } from "react-hook-form";

interface TextInputProps {
  placeholder?: string;
  control: any;
  error?: string;
  name: string;
  label?: string;
  type?: ComponentProps<typeof Input>["type"];
  className?: string;
  disabled?: boolean;
}

export const TextInput = ({
  placeholder,
  control,
  error,
  name,
  label,
  type = "text",
  className,
  disabled = false,
}: TextInputProps) => {
  return (
    <Field className={className}>
      <FieldLabel className="text-sm font-medium text-gray-700">
        {label}
      </FieldLabel>
      <Controller
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            type={type}
            placeholder={placeholder}
            onChange={(event) => {
              if (type === "number") {
                field.onChange(
                  event.target.value === "" ? "" : Number(event.target.value),
                );
                return;
              }

              field.onChange(event);
            }}
          />
        )}
        disabled={disabled}
        name={name}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </Field>
  );
};
