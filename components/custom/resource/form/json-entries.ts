import type { ResourceField } from "../resource-field";

type JsonEntry = { key: string; value: string };

const parseJsonEntries = (
  value: string,
  shape: ResourceField["jsonShape"],
): JsonEntry[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (shape === "cost-array" && Array.isArray(parsed)) {
      return parsed.flatMap((item) =>
        item && typeof item === "object"
          ? [
              {
                key: String((item as Record<string, unknown>).name ?? ""),
                value: String((item as Record<string, unknown>).amount ?? ""),
              },
            ]
          : [],
      );
    }
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.entries(parsed).map(([key, entryValue]) => ({
        key,
        value:
          entryValue && typeof entryValue === "object"
            ? JSON.stringify(entryValue)
            : String(entryValue ?? ""),
      }));
    }
  } catch {
    return [];
  }
  return [];
};

export const jsonEntries = (
  value: string,
  shape: ResourceField["jsonShape"],
  fixedKeys: string[] = [],
): JsonEntry[] => {
  const entries = parseJsonEntries(value, shape);
  return [
    ...fixedKeys.map(
      (key) => entries.find((entry) => entry.key === key) ?? { key, value: "" },
    ),
    ...entries.filter((entry) => !fixedKeys.includes(entry.key)),
  ];
};

export const serializeJsonEntries = (
  entries: JsonEntry[],
  shape: ResourceField["jsonShape"],
) =>
  JSON.stringify(
    shape === "cost-array"
      ? entries.map((entry) => ({
          name: entry.key,
          amount: Number(entry.value.replace(/\D/g, "")),
        }))
      : Object.fromEntries(entries.map((entry) => [entry.key, entry.value])),
  );
