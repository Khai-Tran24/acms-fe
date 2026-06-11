/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller } from "react-hook-form";
import { Input } from "../../ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import type { ComponentProps } from "react";
import { formatCurrency } from "@/lib/helper/currency-exchange.helper";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

interface PriceInputProps {
  placeholder?: string;
  error?: string;
  control: any;
  name: string;
  label?: string;
  className?: string;
  inputProps?: Omit<
    ComponentProps<typeof Input>,
    "name" | "value" | "defaultValue" | "onChange" | "type"
  >;
}

export const PriceInput = ({
  placeholder = "0",
  name,
  error,
  control,
  label,
  className,
  inputProps,
}: PriceInputProps) => {
  return (
    <Field className={className}>
      <FieldLabel className="text-sm font-medium text-gray-700">
        {label}
      </FieldLabel>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const value = Number(field.value);
          const seperatedNumberByThousand =
            Intl.NumberFormat("vi-VN").format(value);
          const formattedValue = isNaN(value) ? "" : seperatedNumberByThousand;

          return (
            <InputGroup>
              <InputGroupInput
                {...field}
                {...inputProps}
                value={formattedValue}
                type="text"
                inputMode="numeric"
                min={0}
                placeholder={placeholder}
                onChange={(event) => {
                  const rawValue = event.target.value.replace(/[^0-9]/g, "");

                  field.onChange(rawValue === "" ? "" : Number(rawValue));
                }}
              />
              <InputGroupAddon align={"inline-end"}>₫</InputGroupAddon>
            </InputGroup>
          );
        }}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </Field>
  );
};
