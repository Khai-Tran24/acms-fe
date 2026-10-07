import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import type { ResourceField } from "../resource-field";
import { formatCurrencyInput } from "./form-values";
import { jsonEntries, serializeJsonEntries } from "./json-entries";

export function JsonField({
  field,
  value,
  onChange,
}: {
  field: ResourceField;
  value: string;
  onChange: (value: string) => void;
}) {
  const entries = jsonEntries(value, field.jsonShape, field.fixedJsonKeys);
  const isCost = field.jsonShape === "cost-array";
  const update = (next: typeof entries) =>
    onChange(serializeJsonEntries(next, field.jsonShape));
  return (
    <div className="space-y-2 rounded-lg border p-3">
      {entries.map((entry, index) => {
        const fixed = field.fixedJsonKeys?.includes(entry.key);
        const valueLabel = isCost
          ? "Số tiền"
          : (field.jsonKeyLabels?.[entry.key] ?? (entry.key || "Giá trị"));
        return (
          <div
            key={`${field.key}-${index}`}
            className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
          >
            <Input
              aria-label={isCost ? "Tên khoản chi" : "Khóa"}
              placeholder={isCost ? "Tên khoản chi" : "Khóa"}
              disabled={fixed}
              readOnly={fixed}
              value={field.jsonKeyLabels?.[entry.key] ?? entry.key}
              onChange={(event) => {
                const key = event.target.value;
                if (
                  !isCost &&
                  key &&
                  entries.some((item, i) => i !== index && item.key === key)
                )
                  return;
                update(
                  entries.map((item, i) =>
                    i === index ? { ...item, key } : item,
                  ),
                );
              }}
            />
            <Input
              aria-label={valueLabel}
              placeholder={valueLabel}
              inputMode={isCost ? "numeric" : undefined}
              value={isCost ? formatCurrencyInput(entry.value) : entry.value}
              onChange={(event) => {
                const value = isCost
                  ? event.target.value.replace(/\D/g, "")
                  : event.target.value;
                update(
                  entries.map((item, i) =>
                    i === index ? { ...item, value } : item,
                  ),
                );
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Xóa dòng"
              disabled={fixed}
              onClick={() => update(entries.filter((_, i) => i !== index))}
            >
              <Trash2 />
            </Button>
          </div>
        );
      })}
      {!field.fixedJsonKeys && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => update([...entries, { key: "", value: "" }])}
        >
          <Plus /> Thêm {isCost ? "khoản chi" : "khóa và giá trị"}
        </Button>
      )}
    </div>
  );
}
