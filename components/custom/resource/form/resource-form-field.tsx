import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarInput } from "@/components/custom/input/calendar-input";
import { ResourceSearchSelect } from "@/components/custom/input/resource-search-select";
import type { ResourceItem, ResourceName } from "@/lib/types/resource.type";
import type { ResourceField } from "../resource-field";
import { AuctionPriceComparison } from "../auction-price-comparison";
import { currencyInputFields, inputType } from "./form-values";
import { JsonField } from "./json-field";
import { CurrencyField } from "./currency-field";
import {
  AuctionContractField,
  ParentContractField,
} from "./contract-select-fields";
import type { ResourceFormController } from "./use-resource-form";

type Props = {
  field: ResourceField;
  resource: ResourceName;
  editing: ResourceItem | null;
  model: ResourceFormController;
};

function FieldControl({ field, resource, editing, model }: Props) {
  const { form, setForm } = model;
  const id = `${resource}-${field.key}`;
  const value = form[field.key];
  const required = field.required && !(editing && field.key === "password");
  const onChange = (value: string) =>
    setForm((current) => ({ ...current, [field.key]: value }));
  if (field.kind === "select")
    return (
      <select
        id={id}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-input bg-card h-10 w-full rounded-md border px-3 text-sm"
      >
        <option value="">Chọn {field.label.toLowerCase()}</option>
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  if (field.kind === "textarea")
    return (
      <Textarea
        id={id}
        required={required}
        value={value}
        placeholder={field.placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  if (field.kind === "date" || field.kind === "datetime")
    return (
      <CalendarInput
        id={id}
        date={value}
        enableTime={field.kind === "datetime"}
        onDateChange={onChange}
      />
    );
  if (field.kind === "json")
    return <JsonField field={field} value={value} onChange={onChange} />;
  if (field.key === "parentContractId")
    return <ParentContractField id={id} editing={editing} model={model} />;
  if (field.key === "assignedToId")
    return (
      <ResourceSearchSelect
        id={id}
        resource="user"
        value={value}
        required={required}
        onValueChange={onChange}
      />
    );
  if (field.key === "contractId" && model.needsContractTerms)
    return (
      <AuctionContractField
        id={id}
        resource={resource}
        required={required}
        model={model}
      />
    );
  if (currencyInputFields.has(field.key))
    return (
      <CurrencyField
        id={id}
        field={field}
        model={model}
        registration={resource === "auction-registration"}
      />
    );
  return (
    <Input
      id={id}
      required={required}
      type={field.key === "password" ? "password" : inputType(field.kind)}
      min={field.kind === "number" ? 0 : undefined}
      disabled={
        resource === "contract" &&
        field.key === "contractNumber" &&
        Boolean(form.parentContractId)
      }
      value={value}
      placeholder={field.placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function ResourceFormField(props: Props) {
  const { field, resource, editing, model } = props;
  return (
    <div
      className={`space-y-2 ${field.key === "depositAmount" && resource !== "auction-registration" ? "grid sm:grid-cols-3 gap-2 items-start" : ""}`}
    >
      <Label htmlFor={`${resource}-${field.key}`} className="col-span-3">
        {field.label}
        {field.required && !(editing && field.key === "password") ? " *" : ""}
      </Label>
      <FieldControl {...props} />
      {resource === "auction-result" && field.key === "winningPrice" && (
        <AuctionPriceComparison
          startingPrice={model.contractTerms?.startingPrice}
          winningPrice={model.form.winningPrice}
        />
      )}
      {model.validationErrors[field.key] && (
        <p role="alert" className="text-sm text-destructive">
          {model.validationErrors[field.key]}
        </p>
      )}
      {field.helpText && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          {field.helpText}
        </p>
      )}
    </div>
  );
}
