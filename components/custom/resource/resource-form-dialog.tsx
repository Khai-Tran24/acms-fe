"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarInput } from "@/components/custom/input/calendar-input";
import { ResourceSearchSelect } from "@/components/custom/input/resource-search-select";
import { createResource, getResource, updateResource } from "@/lib/api/resource/resource.api";
import { useAuth } from "@/lib/context/auth-context";
import { ContractStatus } from "@/lib/enums/contract.enum";
import { toDateTimeInputValue } from "@/lib/helper/date-formatter.helper";
import { useToast } from "@/lib/hooks/use-toast";
import { ResourceItem, ResourceName } from "@/lib/types/resource.type";
import { Plus, Search, Trash2, X } from "lucide-react";
import { useRef, useState } from "react";
import { FieldKind, ResourceField } from "./resource-field";

const emptyForm = (fields: ResourceField[]) =>
  Object.fromEntries(
    fields.map((field) => [field.key, field.defaultValue ?? ""]),
  );

const inputType = (kind?: FieldKind) => {
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

const currencyInputFields = new Set([
  "startingPrice",
  "stepPrice",
  "winningPrice",
  "depositAmount",
  "registrationFee",
]);

const formatCurrencyInput = (value: string) => {
  if (!value) return "";
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(
      amount,
    )
    : "";
};

const toInputValue = (value: unknown, kind?: FieldKind) => {
  if (value === null || value === undefined) return "";
  if (kind === "json") return JSON.stringify(value, null, 2);
  if (kind === "datetime") return toDateTimeInputValue(String(value));
  if (kind === "date") return String(value).slice(0, 10);
  return String(value);
};

const errorMessage = (error: unknown) => {
  const message = (
    error as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;
  return Array.isArray(message) ? message.join(", ") : message;
};

const latestRecord = (value: unknown) => {
  if (!Array.isArray(value)) return undefined;
  return [...value]
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object",
    )
    .sort((left, right) => Number(right.id ?? 0) - Number(left.id ?? 0))[0];
};

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

const jsonEntries = (
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

const serializeJsonEntries = (
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

export function ResourceFormDialog({ resource, singular, fields, editing, onClose, onSaved }: {
  resource: ResourceName;
  singular: string;
  fields: ResourceField[];
  editing: ResourceItem | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const toast = useToast();
  const toastRef = useRef(toast);
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>(() => editing
    ? Object.fromEntries(fields.map((field) => {
      const raw = field.key === "contractId"
        ? editing.contractId ?? (editing.contract as { id?: number } | undefined)?.id
        : field.key === "assignedToId"
          ? editing.assignedToId ?? (editing.assignedTo as { id?: number } | undefined)?.id
          : editing[field.key];
      return [field.key, toInputValue(raw, field.kind)];
    }))
    : { ...emptyForm(fields), ...(resource === "contract" && user?.id ? { assignedToId: String(user.id) } : {}) });
  const [propertyName, setPropertyName] = useState("");
  const [propertyType, setPropertyType] = useState("TAI_SAN_KHAC");
  const [propertyLocation, setPropertyLocation] = useState("");
  const [propertyNote, setPropertyNote] = useState("");
  const [creatingProperty, setCreatingProperty] = useState(false);
  const [checkingContract, setCheckingContract] = useState(false);
  const [contractMessage, setContractMessage] = useState("");
  const [contractProperties, setContractProperties] = useState<
    {
      id: number;
      name: string;
      type?: string;
      note: string;
      originalNote: string;
    }[]
  >(() => {
    const links = (editing?.contractProperties ?? []) as {
      property?: { id: number; propertyName: string; propertyType?: string; propertyNote?: string };
    }[];
    return links.flatMap(({ property }) => property ? [{
      id: property.id,
      name: property.propertyName,
      type: property.propertyType,
      note: property.propertyNote ?? "",
      originalNote: property.propertyNote ?? "",
    }] : []);
  });
  const payload = () =>
    Object.fromEntries(
      fields.filter((field) => field.form !== false).flatMap((field) => {
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

  const createContractProperty = async () => {
    if (!propertyName.trim() || !propertyLocation.trim()) return;
    setCreatingProperty(true);
    try {
      const created = await createResource("property", {
        propertyName: propertyName.trim(),
        propertyType,
        propertyLocation: propertyLocation.trim(),
        propertyNote,
      });
      setContractProperties((current) => [
        ...current,
        {
          id: created.id,
          name: String(created.propertyName),
          type: String(created.propertyType),
          note: propertyNote,
          originalNote: propertyNote,
        },
      ]);
      setPropertyName("");
      setPropertyType("TAI_SAN_KHAC");
      setPropertyLocation("");
      setPropertyNote("");

      toastRef.current.success("Đã tạo và thêm tài sản vào hợp đồng.");
    } catch (error) {
      toastRef.current.error(errorMessage(error) ?? "Không thể tạo tài sản.");
    } finally {
      setCreatingProperty(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const data = payload();
      if (resource === "contract") {
        data.propertyIds = contractProperties.map((property) => property.id);
        for (const property of contractProperties) {
          if (property.note !== property.originalNote) {
            await updateResource("property", property.id, {
              propertyNote: property.note,
            });
            setContractProperties((current) =>
              current.map((item) =>
                item.id === property.id
                  ? { ...item, originalNote: property.note }
                  : item,
              ),
            );
          }
        }
      }
      if (editing) {
        if (resource === "user" && !data.password) {
          delete data.password;
          delete data.assignedContractCount;
        }

        await updateResource(resource, editing.id, data);
      } else await createResource(resource, data);
      toastRef.current.success(
        `${editing ? "Cập nhật" : "Tạo"} ${singular} thành công.`,
      );
      await onSaved();
      onClose();
    } catch (error) {
      toastRef.current.error(
        error instanceof SyntaxError
          ? "Dữ liệu JSON không hợp lệ."
          : (errorMessage(error) ?? `Không thể lưu ${singular}.`),
      );
    } finally {
      setSaving(false);
    }
  };

  const formFields = fields.filter((field) => field.form !== false);

  const lookupContract = async (id = Number(form.contractId)) => {
    if (!Number.isInteger(id) || id < 1) {
      setContractMessage("Vui lòng nhập ID hợp đồng hợp lệ.");
      return;
    }
    setCheckingContract(true);
    try {
      const contract = await getResource("contract", id);
      if (
        resource === "auction-result" &&
        contract.contractStatus !== ContractStatus.DAU_GIA_THANH
      ) {
        setForm((current) =>
          Number(current.contractId) === id
            ? { ...current, contractId: "" }
            : current,
        );
        setContractMessage(
          'Chỉ được chọn hợp đồng có trạng thái "Đấu giá thành".',
        );
        return;
      }
      const sources: Record<string, unknown>[] = [contract];

      if (resource === "announcement" || resource === "auction-result") {
        const regulation = latestRecord(contract.regulations);
        if (regulation) sources.push(regulation);
      }
      if (resource === "auction-result") {
        const announcement = latestRecord(contract.announcements);
        if (announcement) sources.push(announcement);
      }

      const autofilled = Object.fromEntries(
        fields.flatMap((field) => {
          if (field.key === "contractId") return [];
          const source = [...sources]
            .reverse()
            .find((candidate) => candidate[field.key] != null);
          if (!source) return [];
          return [[field.key, toInputValue(source[field.key], field.kind)]];
        }),
      );
      setForm((current) =>
        Number(current.contractId) === id
          ? { ...current, ...autofilled }
          : current,
      );

      const autofilledCount = Object.keys(autofilled).length;
      setContractMessage(
        `Đã tìm thấy: ${String(contract.contractNumber ?? `#${contract.id}`)} — ${String(contract.contractName ?? "Không có tên")}${autofilledCount ? `. Đã tự động điền ${autofilledCount} trường.` : "."}`,
      );
    } catch {
      setContractMessage("Không tìm thấy hợp đồng với ID này.");
    } finally {
      setCheckingContract(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !saving && !creatingProperty) onClose(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Chỉnh sửa" : "Thêm"} {singular}
          </DialogTitle>
          <DialogDescription>
            Các trường có dấu * là bắt buộc.
          </DialogDescription>
        </DialogHeader>
        <fieldset disabled={saving || creatingProperty} className="grid min-w-0 gap-4 py-2 sm:grid-cols-2 -mx-4 max-h-[60vh] overflow-y-auto px-4">
          {formFields.map((field) => (
            <div
              key={field.key}
              className={
                field.kind === "json"
                  ? "space-y-2 sm:col-span-2"
                  : "space-y-2"
              }
            >
              <Label htmlFor={`${resource}-${field.key}`}>
                {field.label}
                {field.required && !(editing && field.key === "password")
                  ? " *"
                  : ""}
              </Label>
              {field.kind === "select" ? (
                <select
                  id={`${resource}-${field.key}`}
                  required={
                    field.required && !(editing && field.key === "password")
                  }
                  value={form[field.key]}
                  onChange={(e) =>
                    setForm({ ...form, [field.key]: e.target.value })
                  }
                  className="border-input bg-card h-10 w-full rounded-md border px-3 text-sm"
                >
                  <option value="">Chọn {field.label.toLowerCase()}</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.kind === "textarea" ? (
                <Textarea
                  id={`${resource}-${field.key}`}
                  required={field.required}
                  value={form[field.key]}
                  placeholder={field.placeholder}
                  onChange={(event) =>
                    setForm({ ...form, [field.key]: event.target.value })
                  }
                />
              ) : field.kind === "date" || field.kind === "datetime" ? (
                <CalendarInput
                  id={`${resource}-${field.key}`}
                  date={form[field.key]}
                  enableTime={field.kind === "datetime"}
                  onDateChange={(value) =>
                    setForm({ ...form, [field.key]: value })
                  }
                />
              ) : field.kind === "json" ? (
                <div className="space-y-2 rounded-lg border p-3">
                  {jsonEntries(
                    form[field.key],
                    field.jsonShape,
                    field.fixedJsonKeys,
                  ).map((entry, index, entries) => (
                    <div
                      key={`${field.key}-${index}`}
                      className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
                    >
                      <Input
                        aria-label={
                          field.jsonShape === "cost-array"
                            ? "Tên khoản chi"
                            : "Khóa"
                        }
                        disabled={
                          field.fixedJsonKeys?.includes("Đơn vị") ||
                          field.fixedJsonKeys?.includes(
                            "Đại diện người có tài sản",
                          )
                        }
                        placeholder={
                          field.jsonShape === "cost-array"
                            ? "Tên khoản chi"
                            : "Khóa"
                        }
                        value={entry.key}
                        readOnly={field.fixedJsonKeys?.includes(entry.key)}
                        onChange={(event) => {
                          if (
                            field.jsonShape !== "cost-array" &&
                            event.target.value &&
                            entries.some(
                              (item, itemIndex) =>
                                itemIndex !== index &&
                                item.key === event.target.value,
                            )
                          )
                            return;
                          const next = entries.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, key: event.target.value }
                              : item,
                          );
                          setForm({
                            ...form,
                            [field.key]: serializeJsonEntries(
                              next,
                              field.jsonShape,
                            ),
                          });
                        }}
                      />
                      <Input
                        aria-label={
                          field.jsonShape === "cost-array"
                            ? "Số tiền"
                            : entry.key || "Giá trị"
                        }
                        placeholder={
                          field.jsonShape === "cost-array"
                            ? "Số tiền"
                            : entry.key || "Giá trị"
                        }
                        inputMode={
                          field.jsonShape === "cost-array"
                            ? "numeric"
                            : undefined
                        }
                        value={
                          field.jsonShape === "cost-array"
                            ? formatCurrencyInput(entry.value)
                            : entry.value
                        }
                        onChange={(event) => {
                          const nextValue =
                            field.jsonShape === "cost-array"
                              ? event.target.value.replace(/\D/g, "")
                              : event.target.value;
                          const next = entries.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, value: nextValue }
                              : item,
                          );
                          setForm({
                            ...form,
                            [field.key]: serializeJsonEntries(
                              next,
                              field.jsonShape,
                            ),
                          });
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Xóa dòng"
                        disabled={field.fixedJsonKeys?.includes(entry.key)}
                        onClick={() =>
                          setForm({
                            ...form,
                            [field.key]: serializeJsonEntries(
                              entries.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                              field.jsonShape,
                            ),
                          })
                        }
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  ))}

                  {field.key !== "customer" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const entries = jsonEntries(
                          form[field.key],
                          field.jsonShape,
                          field.fixedJsonKeys,
                        );
                        setForm({
                          ...form,
                          [field.key]: serializeJsonEntries(
                            [...entries, { key: "", value: "" }],
                            field.jsonShape,
                          ),
                        });
                      }}
                    >
                      <Plus /> Thêm{" "}
                      {field.jsonShape === "cost-array"
                        ? "khoản chi"
                        : "khóa và giá trị"}
                    </Button>
                  )}
                </div>
              ) : field.key === "assignedToId" ? (
                <ResourceSearchSelect
                  id={`${resource}-${field.key}`}
                  resource="user"
                  value={form[field.key]}
                  required={field.required}
                  onValueChange={(value) =>
                    setForm((current) => ({ ...current, [field.key]: value }))
                  }
                />
              ) : field.key === "contractId" &&
                (resource === "regulation" ||
                  resource === "auction-result") ? (
                <div className="space-y-2">
                  <ResourceSearchSelect
                    id={`${resource}-${field.key}`}
                    resource="contract"
                    contractStatus={
                      resource === "auction-result"
                        ? ContractStatus.DAU_GIA_THANH
                        : undefined
                    }
                    value={form[field.key]}
                    required={field.required}
                    disabled={checkingContract}
                    onValueChange={(value) => {
                      setForm((current) => ({
                        ...current,
                        [field.key]: value,
                      }));
                      setContractMessage("");
                      if (value) void lookupContract(Number(value));
                    }}
                  />
                  {resource === "auction-result" && (
                    <p className="text-xs text-muted-foreground">
                      Chỉ hiển thị hợp đồng có trạng thái “Đấu giá thành”.
                    </p>
                  )}
                  {checkingContract && (
                    <p
                      role="status"
                      className="text-xs text-muted-foreground"
                    >
                      Đang tải thông tin hợp đồng...
                    </p>
                  )}
                  {contractMessage && (
                    <p
                      role="status"
                      className="text-xs text-muted-foreground"
                    >
                      {contractMessage}
                    </p>
                  )}
                </div>
              ) : field.key === "contractId" ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id={`${resource}-${field.key}`}
                      required={field.required}
                      type="number"
                      min={1}
                      value={form[field.key]}
                      onChange={(e) => {
                        setForm({ ...form, [field.key]: e.target.value });
                        setContractMessage("");
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={checkingContract || !form[field.key]}
                      onClick={() => void lookupContract()}
                    >
                      <Search />
                      {checkingContract ? "Đang tìm" : "Tìm"}
                    </Button>
                  </div>
                  {contractMessage && (
                    <p className="text-xs text-muted-foreground">
                      {contractMessage}
                    </p>
                  )}
                </div>
              ) : currencyInputFields.has(field.key) ? (
                <div className="relative">
                  <Input
                    id={`${resource}-${field.key}`}
                    required={field.required}
                    type="text"
                    inputMode="numeric"
                    min={0}
                    value={formatCurrencyInput(form[field.key])}
                    placeholder={field.placeholder ?? "0"}
                    className="pr-10"
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      setForm({ ...form, [field.key]: digits });
                    }}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                    ₫
                  </span>
                </div>
              ) : (
                <Input
                  id={`${resource}-${field.key}`}
                  required={
                    field.required && !(editing && field.key === "password")
                  }
                  type={
                    field.key === "password"
                      ? "password"
                      : inputType(field.kind)
                  }
                  min={field.kind === "number" ? 0 : undefined}
                  value={form[field.key]}
                  placeholder={field.placeholder}
                  onChange={(e) =>
                    setForm({ ...form, [field.key]: e.target.value })
                  }
                />
              )}
              {field.helpText && (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {field.helpText}
                </p>
              )}
            </div>
          ))}
          {resource === "contract" && (
            <div className="space-y-3 rounded-lg border bg-accent/30 p-4 sm:col-span-2">
              <div>
                <h3 className="font-semibold">Tạo tài sản cho hợp đồng</h3>
                <p className="text-sm text-muted-foreground">
                  Tài sản được tạo ngay tại đây và tự động gắn vào hợp đồng
                  khi lưu.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="inline-property-name">Tên tài sản</Label>
                  <Input
                    id="inline-property-name"
                    value={propertyName}
                    onChange={(event) => setPropertyName(event.target.value)}
                    placeholder="Nhập tên tài sản"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inline-property-type">Loại tài sản</Label>
                  <select
                    id="inline-property-type"
                    value={propertyType}
                    onChange={(event) => setPropertyType(event.target.value)}
                    className="border-input bg-card h-10 w-full rounded-md border px-3 text-sm"
                  >
                    <option value="DONG_SAN">Động sản</option>
                    <option value="BAT_DONG_SAN">Bất động sản</option>
                    <option value="KHOAN_NO">Khoản nợ</option>
                    <option value="TAI_SAN_KHAC">Tài sản khác</option>
                  </select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="inline-property-location">
                    Địa điểm tài sản
                  </Label>
                  <Input
                    id="inline-property-location"
                    value={propertyLocation}
                    onChange={(event) =>
                      setPropertyLocation(event.target.value)
                    }
                    placeholder="Nhập địa chỉ hoặc nơi lưu giữ tài sản"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="inline-property-note">
                    Ghi chú tài sản
                  </Label>
                  <Textarea
                    id="inline-property-note"
                    value={propertyNote}
                    onChange={(event) => setPropertyNote(event.target.value)}
                    placeholder="Nhập ghi chú về tài sản"
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="sm:col-span-2"
                  disabled={
                    !propertyName.trim() ||
                    !propertyLocation.trim() ||
                    creatingProperty
                  }
                  onClick={createContractProperty}
                >
                  <Plus className="mr-2 size-4" />
                  {creatingProperty ? "Đang tạo..." : "Tạo tài sản"}
                </Button>
              </div>
              {contractProperties.length > 0 && (
                <div className="space-y-3">
                  {contractProperties.map((property) => (
                    <div
                      key={property.id}
                      className="space-y-2 rounded-lg border bg-background p-3 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{property.name}</span>
                        <button
                          type="button"
                          aria-label={`Bỏ ${property.name}`}
                          onClick={() =>
                            setContractProperties((current) =>
                              current.filter(
                                (item) => item.id !== property.id,
                              ),
                            )
                          }
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                      <Label htmlFor={`property-note-${property.id}`}>
                        Ghi chú tài sản
                      </Label>
                      <Textarea
                        id={`property-note-${property.id}`}
                        value={property.note}
                        disabled={saving}
                        placeholder="Nhập ghi chú về tài sản"
                        onChange={(event) =>
                          setContractProperties((current) =>
                            current.map((item) =>
                              item.id === property.id
                                ? { ...item, note: event.target.value }
                                : item,
                            ),
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </fieldset>
        <DialogFooter>
          <Button variant="outline" disabled={saving || creatingProperty} onClick={onClose}>
            Hủy
          </Button>
          <Button
            disabled={
              saving ||
              creatingProperty ||
              checkingContract ||
              formFields.some(
                (field) =>
                  field.required &&
                  !(editing && field.key === "password") &&
                  !form[field.key],
              )
            }
            onClick={save}
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  );
}
