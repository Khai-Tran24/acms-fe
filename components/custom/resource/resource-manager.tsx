"use client";

import Link from "next/link";
import { contractLabel } from "@/lib/helper/contract-label.helper";
import { PageHeading } from "@/components/custom/layout/page-heading";
import { ContractStatusBadge } from "@/components/custom/contract/contract-status-badge";
import { Badge } from "@/components/ui/badge";
import CustomPagination from "@/components/custom/custom-pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteResource,
  getResource,
  getResources,
} from "@/lib/api/resource/resource.api";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useToast } from "@/lib/hooks/use-toast";
import { formatCurrency } from "@/lib/helper/currency-exchange.helper";
import {
  auctionFinalPrice,
  auctionPriceGap,
} from "@/lib/helper/auction-finance.helper";
import { DEFAULT_PAGINATION, Pagination } from "@/lib/types/reponse.type";
import { ResourceItem, ResourceName } from "@/lib/types/resource.type";
import {
  Edit,
  Eye,
  Plus,
  Search,
  Trash2,
  ScrollText,
  Package,
  Users,
  Gavel,
  Megaphone,
  FileCheck2,
  SearchX,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatDate } from "@/lib/helper/date-formatter.helper";

import { ResourceField } from "./resource-field";
import { ResourceFormDialog } from "./resource-form-dialog";

export type { ResourceField } from "./resource-field";

export interface ResourceManagerProps {
  resource: ResourceName;
  title: string;
  singular: string;
  fields: ResourceField[];
  readOnly?: boolean;
}

const displayValue = (value: unknown, field: ResourceField) => {
  if (value === null || value === undefined || value === "") return "—";
  if (field.key === "contractStatus")
    return <ContractStatusBadge value={value} />;
  const option = field.options?.find((item) => item.value === String(value));
  if (option) return option.label;
  if (field.kind === "json") {
    if (typeof value !== "object") return String(value);
    const object = value as Record<string, unknown>;
    return String(object.name ?? object.fullName ?? JSON.stringify(object));
  }
  if (field.kind === "date" || field.kind === "datetime") {
    return formatDate(String(value), field.kind === "datetime");
  }
  if (
    [
      "startingPrice",
      "depositAmount",
      "stepPrice",
      "registrationFee",
      "winningPrice",
      "finalPrice",
      "priceGap",
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
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ResourceItem | null>(null);
  const [viewing, setViewing] = useState<ResourceItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
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
    setFormOpen(true);
  };

  const openEdit = async (item: ResourceItem) => {
    try {
      setEditing(await getResource(resource, item.id));
      setFormOpen(true);
    } catch (error) {
      toastRef.current.error(
        errorMessage(error) ?? `Không thể tải ${singular}.`,
      );
    }
  };

  const openView = async (item: ResourceItem) => {
    if (resource !== "user" && resource !== "auction-registration") {
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

  const visibleFields = fields.filter((field) => field.table !== false);
  const tableFields =
    resource === "auction-registration" || resource === "auction-result"
      ? visibleFields
      : visibleFields.slice(0, 6);
  const ResourceIcon = {
    contract: ScrollText,
    property: Package,
    user: Users,
    regulation: Gavel,
    announcement: Megaphone,
    "auction-result": FileCheck2,
    "auction-registration": Users,
  }[resource];

  return (
    <div className="page-container">
      <PageHeading
        title={title}
        description={
          readOnly
            ? "Tra cứu và kết nối với các thành viên trong hệ thống."
            : `Theo dõi, tra cứu và cập nhật ${singular} tại một nơi.`
        }
        icon={<ResourceIcon aria-hidden="true" />}
        actions={
          !readOnly && (
            <Button onClick={openCreate}>
              <Plus className="size-4" /> Thêm {singular}
            </Button>
          )
        }
      />

      <section className="surface-panel p-4 md:p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-48 max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
              aria-label={`Tìm kiếm ${singular}`}
              placeholder={`Tìm kiếm ${singular}...`}
            />
          </div>
          <Badge variant="secondary" className="h-auto px-3 py-1.5 font-medium">
            {pagination.totalItems} kết quả
          </Badge>
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
                    <div className="flex flex-col items-center gap-2 py-6">
                      <span className="rounded-2xl bg-muted p-3">
                        <SearchX className="size-6 text-muted-foreground" />
                      </span>
                      <p className="font-medium text-foreground">
                        {search ? "Không tìm thấy kết quả" : "Chưa có dữ liệu"}
                      </p>
                      <p className="text-xs">
                        {search
                          ? "Thử tìm kiếm bằng từ khóa khác."
                          : `Thêm ${singular} để bắt đầu quản lý.`}
                      </p>
                    </div>
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
                        {field.key === "parentContractId" ? (
                          item.parentContractId ? (
                            <Link
                              className="text-primary underline"
                              href={`${pathname.startsWith("/admin") ? "/admin" : ""}/contracts/${item.parentContractId}`}
                            >
                              {String(
                                (
                                  item.parentContract as
                                    ResourceItem | undefined
                                )?.contractNumber || "Chưa có số hợp đồng",
                              )}
                            </Link>
                          ) : (
                            "—"
                          )
                        ) : (
                          displayValue(
                            field.key === "contractId"
                              ? item.contract
                                ? contractLabel(item.contract as ResourceItem)
                                : "—"
                              : field.key === "priceGap"
                                ? auctionPriceGap(
                                    item.startingPrice,
                                    item.winningPrice,
                                  )
                                : field.key === "finalPrice"
                                  ? auctionFinalPrice(
                                      item.winningPrice,
                                      item.auctionCost,
                                    )
                                  : resource === "contract" &&
                                      field.key === "contractNumber"
                                    ? contractLabel(item)
                                    : item[field.key],
                            field,
                          )
                        )}
                      </TableCell>
                    ))}
                    {!readOnly && (
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Xem chi tiết"
                            aria-label={`Xem ${singular} #${item.id}`}
                            onClick={() => openView(item)}
                          >
                            <Eye />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Chỉnh sửa"
                            aria-label={`Chỉnh sửa ${singular} #${item.id}`}
                            onClick={() => openEdit(item)}
                          >
                            <Edit />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Xóa"
                            aria-label={`Xóa ${singular} #${item.id}`}
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
        <div className="mt-5 border-t pt-4">
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

      {formOpen && (
        <ResourceFormDialog
          resource={resource}
          singular={singular}
          fields={fields}
          editing={editing}
          onClose={() => setFormOpen(false)}
          onSaved={load}
        />
      )}

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
                          ? contractLabel(viewing.contract as ResourceItem)
                          : "—"
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
