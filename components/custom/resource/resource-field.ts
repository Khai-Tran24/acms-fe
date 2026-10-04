export type FieldKind =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "datetime"
  | "time"
  | "json"
  | "select";

export interface ResourceField {
  key: string;
  label: string;
  kind?: FieldKind;
  required?: boolean;
  options?: { label: string; value: string }[];
  table?: boolean;
  form?: boolean;
  defaultValue?: string;
  placeholder?: string;
  helpText?: string;
  sendEmptyAsNull?: boolean;
  jsonShape?: "object" | "cost-array";
  fixedJsonKeys?: string[];
}

