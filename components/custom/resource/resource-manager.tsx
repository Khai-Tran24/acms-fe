"use client";

import CustomPagination from "@/components/custom/custom-pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createResource,
  deleteResource,
  getResource,
  getResources,
  updateResource,
} from "@/lib/api/resource/resource.api";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useToast } from "@/lib/hooks/use-toast";
import { formatCurrency } from "@/lib/helper/currency-exchange.helper";
import { auctionFinalPrice } from "@/lib/helper/auction-finance.helper";
import { DEFAULT_PAGINATION, Pagination } from "@/lib/types/reponse.type";
import { ResourceItem, ResourceName } from "@/lib/types/resource.type";
import { Edit, Eye, Plus, Search, Trash2, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { formatDate } from "date-fns";

type FieldKind =
  | "text"
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
}

export interface ResourceManagerProps {
  resource: ResourceName;
  title: string;
  singular: string;
  fields: ResourceField[];
  readOnly?: boolean;
}

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
  if (kind === "datetime") return String(value).slice(0, 16);
  if (kind === "date") return String(value).slice(0, 10);
  return String(value);
};

const displayValue = (value: unknown, field: ResourceField) => {
  if (value === null || value === undefined || value === "") return "—";
  const option = field.options?.find((item) => item.value === String(value));
  if (option) return option.label;
  if (field.kind === "json") {
    if (typeof value !== "object") return String(value);
    const object = value as Record<string, unknown>;
    return String(object.name ?? object.fullName ?? JSON.stringify(object));
  }
  if (field.kind === "date" || field.kind === "datetime") {
    const date = new Date(String(value));
    return Number.isNaN(date.getTime())
      ? String(value)
      : formatDate(
          date,
          field.kind === "date" ? "dd/MM/yyyy" : "HH:mm dd/MM/yyyy",
        );
  }
  if (
    [
      "startingPrice",
      "depositAmount",
      "stepPrice",
      "registrationFee",
      "winningPrice",
      "finalPrice",
    ].includes(field.key)
  ) {
    return formatCurrency(Number(value));
  }
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

const jsonEntries = (
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

export function ResourceManager({
  resource,
  title,
  singular,
  fields,
  readOnly = false,
}: ResourceManagerProps) {
  const toast = useToast();
  const toastRef = useRef(toast);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<ResourceItem | null>(null);
  const [viewing, setViewing] = useState<ResourceItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>(() =>
    emptyForm(fields),
  );
  const [propertyName, setPropertyName] = useState("");
  const [propertyType, setPropertyType] = useState("TAI_SAN_KHAC");
  const [propertyLocation, setPropertyLocation] = useState("");
  const [creatingProperty, setCreatingProperty] = useState(false);
  const [checkingAssignee, setCheckingAssignee] = useState(false);
  const [assigneeMessage, setAssigneeMessage] = useState("");
  const [checkingContract, setCheckingContract] = useState(false);
  const [contractMessage, setContractMessage] = useState("");
  const [contractProperties, setContractProperties] = useState<
    { id: number; name: string; type?: string }[]
  >([]);
  const debouncedSearch = useDebounce(search, 400);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getResources(resource, {
        page,
        limit,
        search: debouncedSearch || undefined,
      });
      setItems(data.items);
      setPagination(data.pagination);
    } catch (error) {
      toastRef.current.error(
        errorMessage(error) ?? `Không thể tải danh sách ${singular}.`,
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, limit, page, resource, singular]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyForm(fields),
      ...(resource === "contract" && user?.id
        ? { assignedToId: String(user.id) }
        : {}),
    });
    setAssigneeMessage("");
    setContractMessage("");
    setContractProperties([]);
    setPropertyName("");
    setPropertyType("TAI_SAN_KHAC");
    setPropertyLocation("");
    setFormOpen(true);
  };

  const openEdit = async (item: ResourceItem) => {
    try {
      setAssigneeMessage("");
      setContractMessage("");
      const detail = await getResource(resource, item.id);
      setEditing(detail);
      setForm(
        Object.fromEntries(
          fields.map((field) => {
            const raw =
              field.key === "contractId"
                ? (detail.contract as { id?: number } | undefined)?.id
                : detail[field.key];
            return [field.key, toInputValue(raw, field.kind)];
          }),
        ),
      );
      if (resource === "contract") {
        const links = (detail.contractProperties ?? []) as {
          property?: {
            id: number;
            propertyName: string;
            propertyType?: string;
          };
        }[];
        setContractProperties(
          links.flatMap((link) =>
            link.property
              ? [
                  {
                    id: link.property.id,
                    name: link.property.propertyName,
                    type: link.property.propertyType,
                  },
                ]
              : [],
          ),
        );
      }
      setFormOpen(true);
    } catch (error) {
      toastRef.current.error(
        errorMessage(error) ?? `Không thể tải ${singular}.`,
      );
    }
  };

  const openView = async (item: ResourceItem) => {
    if (resource !== "user") {
      router.push(`${pathname}/${item.id}`);
      return;
    }
    try {
      setViewing(await getResource(resource, item.id));
    } catch (error) {
      toastRef.current.error(
        errorMessage(error) ?? `Không thể tải ${singular}.`,
      );
    }
  };

  const payload = () =>
    Object.fromEntries(
      fields.flatMap((field) => {
        const value = form[field.key];
        if (!field.required && value === "")
          return field.sendEmptyAsNull ? [[field.key, null]] : [];
        if (field.kind === "number") return [[field.key, Number(value)]];
        if (field.key === "isActive") return [[field.key, value === "true"]];
        if (field.kind === "json") return [[field.key, JSON.parse(value)]];
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
      });
      setContractProperties((current) => [
        ...current,
        {
          id: created.id,
          name: String(created.propertyName),
          type: String(created.propertyType),
        },
      ]);
      setPropertyName("");
      setPropertyType("TAI_SAN_KHAC");
      setPropertyLocation("");
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
      }
      if (editing) {
        if (resource === "user" && !data.password) delete data.password;
        await updateResource(resource, editing.id, data);
      } else await createResource(resource, data);
      toastRef.current.success(
        `${editing ? "Cập nhật" : "Tạo"} ${singular} thành công.`,
      );
      setFormOpen(false);
      await load();
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

  const remove = async (item: ResourceItem) => {
    if (!window.confirm(`Bạn có chắc muốn xóa ${singular} này?`)) return;
    try {
      await deleteResource(resource, item.id);
      toastRef.current.success(`Đã xóa ${singular}.`);
      if (items.length === 1 && page > 1) setPage(page - 1);
      else await load();
    } catch (error) {
      toastRef.current.error(
        errorMessage(error) ?? `Không thể xóa ${singular}.`,
      );
    }
  };

  const tableFields = fields
    .filter((field) => field.table !== false)
    .slice(0, 6);
  const formFields = fields.filter((field) => field.form !== false);

  const lookupAssignee = async () => {
    const id = Number(form.assignedToId);
    if (!Number.isInteger(id) || id < 1) {
      setAssigneeMessage("Vui lòng nhập ID người phụ trách hợp lệ.");
      return;
    }
    setCheckingAssignee(true);
    try {
      const member = await getResource("user", id);
      setAssigneeMessage(
        `Đã tìm thấy: ${String(member.fullName ?? member.username)} (${String(member.email ?? "")})`,
      );
    } catch {
      setAssigneeMessage("Không tìm thấy người dùng với ID này.");
    } finally {
      setCheckingAssignee(false);
    }
  };

  const lookupContract = async () => {
    const id = Number(form.contractId);
    if (!Number.isInteger(id) || id < 1) {
      setContractMessage("Vui lòng nhập ID hợp đồng hợp lệ.");
      return;
    }
    setCheckingContract(true);
    try {
      const contract = await getResource("contract", id);
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
      setForm((current) => ({ ...current, ...autofilled }));

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
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {readOnly
              ? "Tìm kiếm thông tin thành viên trong hệ thống."
              : "Tạo, xem, chỉnh sửa và xóa dữ liệu trực tiếp từ hệ thống."}
          </p>
        </div>
        {!readOnly && (
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" />
            Thêm {singular}
          </Button>
        )}
      </div>

      <section className="rounded-xl bg-card p-4 shadow-sm ring-1 ring-foreground/10">
        <div className="mb-4 flex items-center gap-2">
          <div className="relative max-w-xl flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
              placeholder={`Tìm kiếm ${singular}...`}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {pagination.totalItems} kết quả
          </span>
        </div>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">ID</TableHead>
                {tableFields.map((field) => (
                  <TableHead key={field.key}>{field.label}</TableHead>
                ))}
                {!readOnly && (
                  <TableHead className="w-36 text-right">Thao tác</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={tableFields.length + (readOnly ? 1 : 2)}
                    className="h-28 text-center"
                  >
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={tableFields.length + (readOnly ? 1 : 2)}
                    className="h-28 text-center text-muted-foreground"
                  >
                    Chưa có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-muted-foreground">
                      {item.id}
                    </TableCell>
                    {tableFields.map((field) => (
                      <TableCell key={field.key} className="max-w-64 truncate">
                        {displayValue(
                          field.key === "contractId"
                            ? (item.contract as { contractNumber?: string })
                                ?.contractNumber
                            : field.key === "finalPrice"
                              ? auctionFinalPrice(
                                  item.winningPrice,
                                  item.auctionCost,
                                )
                              : item[field.key],
                          field,
                        )}
                      </TableCell>
                    ))}
                    {!readOnly && (
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Xem"
                            onClick={() => openView(item)}
                          >
                            <Eye />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Sửa"
                            onClick={() => openEdit(item)}
                          >
                            <Edit />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Xóa"
                            className="text-destructive"
                            onClick={() => remove(item)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4">
          <CustomPagination
            currentPage={pagination.page}
            pageSize={pagination.limit}
            totalItems={pagination.totalItems}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            onPageSizeChange={(value) => {
              setLimit(value);
              setPage(1);
            }}
          />
        </div>
      </section>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Chỉnh sửa" : "Thêm"} {singular}
            </DialogTitle>
            <DialogDescription>
              Các trường có dấu * là bắt buộc.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
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
                    className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                  >
                    <option value="">Chọn {field.label.toLowerCase()}</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.kind === "json" ? (
                  <div className="space-y-2 rounded-lg border p-3">
                    {jsonEntries(form[field.key], field.jsonShape).map(
                      (entry, index, entries) => (
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
                            placeholder={
                              field.jsonShape === "cost-array"
                                ? "Tên khoản chi"
                                : "Khóa"
                            }
                            value={entry.key}
                            onChange={(event) => {
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
                                : "Giá trị"
                            }
                            placeholder={
                              field.jsonShape === "cost-array"
                                ? "Số tiền"
                                : "Giá trị"
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
                      ),
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const entries = jsonEntries(
                          form[field.key],
                          field.jsonShape,
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
                  </div>
                ) : field.key === "assignedToId" ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        id={`${resource}-${field.key}`}
                        type="number"
                        min={1}
                        value={form[field.key]}
                        onChange={(e) => {
                          setForm({ ...form, [field.key]: e.target.value });
                          setAssigneeMessage("");
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={checkingAssignee || !form[field.key]}
                        onClick={() => void lookupAssignee()}
                      >
                        <Search />
                        {checkingAssignee ? "Đang tìm" : "Tìm"}
                      </Button>
                    </div>
                    {assigneeMessage && (
                      <p className="text-xs text-muted-foreground">
                        {assigneeMessage}
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
              <div className="space-y-3 rounded-lg border bg-muted/20 p-4 sm:col-span-2">
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
                      className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
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
                  <Button
                    type="button"
                    variant="secondary"
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
                  <div className="flex flex-wrap gap-2">
                    {contractProperties.map((property) => (
                      <div
                        key={property.id}
                        className="flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm"
                      >
                        <span>{property.name}</span>
                        <button
                          type="button"
                          aria-label={`Bỏ ${property.name}`}
                          onClick={() =>
                            setContractProperties((current) =>
                              current.filter((item) => item.id !== property.id),
                            )
                          }
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Hủy
            </Button>
            <Button
              disabled={
                saving ||
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

      <Dialog
        open={Boolean(viewing)}
        onOpenChange={(open) => !open && setViewing(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết {singular}</DialogTitle>
            <DialogDescription>Mã bản ghi: {viewing?.id}</DialogDescription>
          </DialogHeader>
          <dl className="grid gap-4 sm:grid-cols-2">
            {viewing &&
              fields.map((field) => (
                <div
                  key={field.key}
                  className={field.kind === "json" ? "sm:col-span-2" : ""}
                >
                  <dt className="text-sm font-medium text-muted-foreground">
                    {field.label}
                  </dt>
                  <dd className="mt-1 whitespace-pre-wrap break-words">
                    {displayValue(
                      field.key === "contractId"
                        ? viewing.contract
                        : viewing[field.key],
                      field,
                    )}
                  </dd>
                </div>
              ))}
          </dl>
        </DialogContent>
      </Dialog>
    </div>
  );
}
