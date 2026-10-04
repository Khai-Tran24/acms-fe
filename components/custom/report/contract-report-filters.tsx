"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarInput } from "@/components/custom/input/calendar-input";
import { ResourceSearchSelect } from "@/components/custom/input/resource-search-select";
import { resourceConfigs } from "@/components/custom/resource/resource-fields";
import { CONTRACT_STATUS_LABELS } from "@/components/custom/contract/contract-utils";
import { ContractStatus } from "@/lib/enums/contract.enum";
import { ContractReportQuery } from "@/lib/types/report.type";

const defaults = {
  search: "",
  contractNumber: "",
  contractStatus: "",
  contractType: "",
  contractOwnerType: "",
  contractDateFrom: "",
  contractDateTo: "",
  assignedToId: "",
  createdById: "",
  propertyId: "",
  createdFrom: "",
  createdTo: "",
  sortBy: "createdAt",
  sortOrder: "DESC",
};

const sortOptions: {
  value: NonNullable<ContractReportQuery["sortBy"]>;
  label: string;
}[] = [
  { value: "id", label: "ID hợp đồng" },
  { value: "contractNumber", label: "Số hợp đồng" },
  { value: "contractType", label: "Loại hợp đồng" },
  { value: "contractOwnerType", label: "Danh mục tài sản" },
  { value: "contractDate", label: "Ngày ký" },
  { value: "contractStatus", label: "Trạng thái" },
  { value: "startingPrice", label: "Giá khởi điểm" },
  { value: "stepPrice", label: "Bước giá" },
  { value: "createdAt", label: "Ngày tạo" },
  { value: "updatedAt", label: "Ngày cập nhật" },
];

export function ContractReportFilters({
  onApply,
}: {
  onApply: (query: ContractReportQuery) => void;
}) {
  const [filters, setFilters] = useState(defaults);
  const [error, setError] = useState("");
  const update = (key: keyof typeof defaults, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const apply = (event: React.FormEvent) => {
    event.preventDefault();
    if (
      (filters.contractDateFrom &&
        filters.contractDateTo &&
        filters.contractDateFrom > filters.contractDateTo) ||
      (filters.createdFrom &&
        filters.createdTo &&
        filters.createdFrom > filters.createdTo)
    ) {
      setError("Thời điểm bắt đầu không thể sau thời điểm kết thúc.");
      return;
    }
    setError("");
    onApply({
      search: filters.search.trim() || undefined,
      contractNumber: filters.contractNumber.trim() || undefined,
      contractStatus: (filters.contractStatus || undefined) as
        ContractStatus | undefined,
      contractType: filters.contractType || undefined,
      contractOwnerType: filters.contractOwnerType || undefined,
      contractDateFrom: filters.contractDateFrom || undefined,
      contractDateTo: filters.contractDateTo || undefined,
      assignedToId: filters.assignedToId
        ? Number(filters.assignedToId)
        : undefined,
      createdById: filters.createdById
        ? Number(filters.createdById)
        : undefined,
      propertyId: filters.propertyId ? Number(filters.propertyId) : undefined,
      createdFrom: filters.createdFrom
        ? new Date(filters.createdFrom).toISOString()
        : undefined,
      createdTo: filters.createdTo
        ? new Date(filters.createdTo).toISOString()
        : undefined,
      sortBy: filters.sortBy as ContractReportQuery["sortBy"],
      sortOrder: filters.sortOrder as ContractReportQuery["sortOrder"],
    });
  };

  return (
    <form onSubmit={apply} className="surface-panel space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(
          [
            ["search", "Từ khóa", "Số hợp đồng, khách hàng..."],
            ["contractNumber", "Số hợp đồng", "Nhập số hợp đồng"],
          ] as const
        ).map(([key, label, placeholder]) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={`report-${key}`}>{label}</Label>
            <Input
              id={`report-${key}`}
              value={filters[key]}
              placeholder={placeholder}
              onChange={(event) => update(key, event.target.value)}
            />
          </div>
        ))}
        {(
          [
            {
              key: "contractStatus",
              label: "Trạng thái",
              options: Object.values(ContractStatus).map((value) => ({
                value,
                label: CONTRACT_STATUS_LABELS[value],
              })),
            },
            ...(["contractType", "contractOwnerType"] as const).map((key) => {
              const field = resourceConfigs.contract.fields.find(
                (field) => field.key === key,
              )!;
              return { key, label: field.label, options: field.options ?? [] };
            }),
          ] as const
        ).map(({ key, label, options }) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={`report-${key}`}>{label}</Label>
            <Select
              value={filters[key] || "all"}
              onValueChange={(value) =>
                update(key, value === "all" ? "" : value)
              }
            >
              <SelectTrigger id={`report-${key}`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
        {(
          [
            ["contractDateFrom", "Từ ngày"],
            ["contractDateTo", "Đến ngày"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={`report-${key}`}>{label}</Label>
            <CalendarInput
              id={`report-${key}`}
              date={filters[key]}
              onDateChange={(value) => update(key, value)}
            />
          </div>
        ))}
      </div>
      <details className="rounded-lg border p-4">
        <summary className="cursor-pointer text-sm font-medium">
          Bộ lọc bổ sung và sắp xếp
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(
            [
              ["assignedToId", "Người phụ trách", "user"],
              ["createdById", "Người tạo", "user"],
              ["propertyId", "Tài sản", "property"],
            ] as const
          ).map(([key, label, resource]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={`report-${key}`}>{label}</Label>
              <ResourceSearchSelect
                id={`report-${key}`}
                resource={resource}
                value={filters[key]}
                onValueChange={(value) => update(key, value)}
              />
            </div>
          ))}
          {(
            [
              ["createdFrom", "Thời điểm tạo từ"],
              ["createdTo", "Thời điểm tạo đến"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={`report-${key}`}>{label}</Label>
              <CalendarInput
                id={`report-${key}`}
                enableTime
                date={filters[key]}
                onDateChange={(value) => update(key, value)}
              />
            </div>
          ))}
          <div className="space-y-2">
            <Label htmlFor="report-sortBy">Sắp xếp theo</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => update("sortBy", value)}
            >
              <SelectTrigger id="report-sortBy" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="report-sortOrder">Thứ tự</Label>
            <Select
              value={filters.sortOrder}
              onValueChange={(value) => update("sortOrder", value)}
            >
              <SelectTrigger id="report-sortOrder" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DESC">Giảm dần</SelectItem>
                <SelectItem value="ASC">Tăng dần</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </details>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit">
          <Search /> Xem báo cáo
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setFilters(defaults);
            setError("");
            onApply({});
          }}
        >
          Xóa bộ lọc
        </Button>
        <p className="text-xs text-muted-foreground">
          Nhấn “Xem báo cáo” để áp dụng bộ lọc cho bảng, thống kê và tệp xuất.
        </p>
      </div>
    </form>
  );
}
