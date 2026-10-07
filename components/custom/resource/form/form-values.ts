import { toDateTimeInputValue } from "@/lib/helper/date-formatter.helper";
import type { FieldKind, ResourceField } from "../resource-field";
import type { ResourceItem } from "@/lib/types/resource.type";
import type { Dispatch, SetStateAction } from "react";

export type FormValues = Record<string, string>;
export type SetFormValues = Dispatch<SetStateAction<FormValues>>;
export interface ContractPropertyValue {
  id: number;
  name: string;
  type?: string;
  note: string;
  originalNote: string;
}

export const emptyForm = (fields: ResourceField[]) =>
  Object.fromEntries(
    fields.map((field) => [field.key, field.defaultValue ?? ""]),
  );

export const inputType = (kind?: FieldKind) => {
  if (
    kind === "number" ||
    kind === "date" ||
    kind === "datetime" ||
    kind === "time"
  ) {
    return kind === "datetime" ? "datetime-local" : kind;
  }
  return "text";
};

export const currencyInputFields = new Set([
  "startingPrice",
  "stepPrice",
  "winningPrice",
  "depositAmount",
  "registrationFee",
]);

export const formatCurrencyInput = (value: string) => {
  if (!value) return "";
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(
        amount,
      )
    : "";
};

export const toInputValue = (value: unknown, kind?: FieldKind) => {
  if (value === null || value === undefined) return "";
  if (kind === "json") return JSON.stringify(value, null, 2);
  if (kind === "datetime") return toDateTimeInputValue(String(value));
  if (kind === "date") return String(value).slice(0, 10);
  return String(value);
};

export const errorMessage = (error: unknown) => {
  const message = (
    error as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;
  return Array.isArray(message) ? message.join(", ") : message;
};

export const resourcePayload = (fields: ResourceField[], form: FormValues) =>
  Object.fromEntries(
    fields
      .filter((field) => field.form !== false)
      .flatMap((field) => {
        const value = form[field.key];
        if (
          !field.required &&
          value === "" &&
          field.kind !== "textarea" &&
          !field.fixedJsonKeys
        )
          return field.sendEmptyAsNull ? [[field.key, null]] : [];
        if (field.kind === "number") return [[field.key, Number(value)]];
        if (field.key === "isActive") return [[field.key, value === "true"]];
        if (field.kind === "json") {
          if (field.fixedJsonKeys) {
            return [
              [
                field.key,
                {
                  ...Object.fromEntries(
                    field.fixedJsonKeys.map((key) => [key, ""]),
                  ),
                  ...JSON.parse(value || "{}"),
                },
              ],
            ];
          }
          return [[field.key, JSON.parse(value)]];
        }
        if (field.kind === "datetime")
          return [[field.key, new Date(value).toISOString()]];
        return [[field.key, value]];
      }),
  );

export function itemFormValues(
  fields: ResourceField[],
  item: ResourceItem,
): FormValues {
  return Object.fromEntries(
    fields.map((field) => {
      const relation =
        field.key === "contractId"
          ? "contract"
          : field.key === "assignedToId"
            ? "assignedTo"
            : null;
      const raw =
        item[field.key] ??
        (relation ? (item[relation] as { id?: number } | null)?.id : undefined);
      return [field.key, toInputValue(raw, field.kind)];
    }),
  );
}

export function parentFormValues(
  fields: ResourceField[],
  parent: ResourceItem,
): FormValues {
  const inherited = [
    "contractOwnerType",
    "contractDate",
    "assignedToId",
    "startingPrice",
    "stepPrice",
    "customer",
  ];
  return itemFormValues(
    fields.filter((field) => inherited.includes(field.key)),
    parent,
  );
}

export function linkedProperties(
  item: ResourceItem | null,
): ContractPropertyValue[] {
  const links = (item?.contractProperties ?? []) as {
    property?: {
      id: number;
      propertyName: string;
      propertyType?: string;
      propertyNote?: string;
    } | null;
  }[];
  return links.flatMap(({ property }) =>
    property
      ? [
          {
            id: property.id,
            name: property.propertyName,
            type: property.propertyType,
            note: property.propertyNote ?? "",
            originalNote: property.propertyNote ?? "",
          },
        ]
      : [],
  );
}
