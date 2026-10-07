import { Input } from "@/components/ui/input";
import {
  applyDepositPercentage,
  applyMoneyInput,
} from "@/lib/helper/auction-form.helper";
import type { ResourceField } from "../resource-field";
import type { ResourceFormController } from "./use-resource-form";
import { formatCurrencyInput } from "./form-values";

export function CurrencyField({
  id,
  field,
  model,
  registration,
}: {
  id: string;
  field: ResourceField;
  model: ResourceFormController;
  registration: boolean;
}) {
  const {
    form,
    setForm,
    depositPercentInput,
    setDepositPercentInput,
    depositAmountPercentage,
  } = model;
  return (
    <>
      <div className="relative col-span-2">
        <Input
          id={id}
          required={field.required}
          type="text"
          inputMode="numeric"
          value={formatCurrencyInput(form[field.key])}
          placeholder={field.placeholder ?? "0"}
          className="pr-10"
          onChange={(event) => {
            setForm((current) =>
              applyMoneyInput(
                current,
                field.key,
                event.target.value,
                registration ? null : depositPercentInput,
              ),
            );
            if (field.key === "depositAmount") setDepositPercentInput(null);
          }}
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
          ₫
        </span>
      </div>
      {!registration && field.key === "depositAmount" && (
        <div className="relative col-span-1">
          <Input
            type="text"
            className="pr-10"
            inputMode="decimal"
            aria-label="Phần trăm tiền đặt trước"
            value={depositAmountPercentage}
            onChange={(event) => {
              const percentage = event.target.value.replace(",", ".");
              if (!/^\d*(\.\d*)?$/.test(percentage)) return;
              setDepositPercentInput(percentage);
              setForm((current) => applyDepositPercentage(current, percentage));
            }}
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
            %
          </span>
        </div>
      )}
    </>
  );
}
