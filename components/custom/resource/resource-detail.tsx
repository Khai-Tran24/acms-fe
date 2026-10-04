"use client";

import { formatDate } from "@/lib/helper/date-formatter.helper";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getResource } from "@/lib/api/resource/resource.api";
import { ResourceItem, ResourceName } from "@/lib/types/resource.type";
import {
  ArrowLeft,
  CalendarDays,
  CircleAlert,
  FileText,
  Info,
  Layers,
  Pencil,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { ContractStatusBadge as StatusBadge } from "@/components/custom/contract/contract-status-badge";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ResourceFormDialog } from "./resource-form-dialog";
import { resourceConfigs } from "./resource-fields";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FileSection } from "@/components/custom/file/file-section";
import { FileEntityType, ManagedFile } from "@/lib/types/file.type";
import {
  auctionCostTotal,
  auctionFinalPrice,
} from "@/lib/helper/auction-finance.helper";
import { formatCurrency } from "@/lib/helper/currency-exchange.helper";

const fileEntityTypes: Partial<Record<ResourceName, FileEntityType>> = {
  contract: "CONTRACT",
  regulation: "REGULATION",
  announcement: "ANNOUNCEMENT",
  "auction-result": "AUCTION_RESULT",
};

const labels: Record<string, string> = {
  id: "ID",
  contractNumber: "Số hợp đồng",
  contractType: "Loại hợp đồng",
  contractOwnerType: "Danh mục tài sản",
  contractDate: "Ngày ký hợp đồng",
  contractStatus: "Trạng thái",
  regulationNumber: "Số quy chế",
  announcementNumber: "Số thông báo",
  auctionResultNumber: "Số kết quả",
  startingPrice: "Giá khởi điểm",
  depositAmount: "Tiền đặt trước",
  stepPrice: "Bước giá",
  registrationFee: "Phí đăng ký",
  startRegisterDate: "Bắt đầu đăng ký",
  endRegisterDate: "Kết thúc đăng ký",
  auctionDate: "Ngày đấu giá",
  auctionTime: "Giờ/thời lượng đấu giá",
  auctionFormat: "Hình thức đấu giá",
  auctionMethod: "Phương thức đấu giá",
  winningPrice: "Giá trúng",
  auctionCost: "Chi phí đấu giá",
  completedAt: "Thời gian hoàn tất",
  winner: "Người trúng đấu giá",
  contract: "Hợp đồng",
  customer: "Người có tài sản",
  assignedTo: "Người phụ trách",
  createdBy: "Người tạo",
  properties: "Tài sản",
  regulations: "Quy chế",
  announcements: "Thông báo",
  auctionResults: "Kết quả đấu giá",
  createdAt: "Ngày tạo",
  updatedAt: "Ngày cập nhật",
  username: "Tên đăng nhập",
  fullName: "Họ và tên",
  email: "Email",
  phone: "Số điện thoại",
  name: "Tên",
  propertyName: "Tên tài sản",
  propertyType: "Loại tài sản",
  propertyLocation: "Địa điểm tài sản",
  propertyNote: "Ghi chú tài sản",
  contractProperties: "Tài sản",
  property: "Tài sản",
  amount: "Số tiền",
  contractId: "Mã hợp đồng",
  propertyId: "Mã tài sản",
  assignedToId: "Mã người phụ trách",
  createdById: "Mã người tạo",
  role: "Vai trò",
  finalPrice: "Giá trị sau chi phí",
  address: "Địa chỉ",
  note: "Ghi chú",
  description: "Mô tả",
};

const label = (key: string) =>
  labels[key] ??
  key.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase());
const isDateKey = (key: string) =>
  key.endsWith("At") || key.toLowerCase().includes("date");
const isMoneyKey = (key: string) =>
  [
    "startingPrice",
    "depositAmount",
    "stepPrice",
    "registrationFee",
    "winningPrice",
    "amount",
    "auctionCost",
    "finalPrice",
  ].includes(key);

const hiddenDetailFields = new Set([
  "passwordresetotpexpiresat",
  "emailverificationotpexpiresat",
  "isactive",
  "avatar",
  "createdat",
  "updatedat",
]);

const normalizedKey = (key: string) => key.replace(/_/g, "").toLowerCase();

const shouldHideField = (key: string, hideIds: boolean) =>
  hiddenDetailFields.has(normalizedKey(key)) ||
  (hideIds && normalizedKey(key) === "id");

const enumLabels: Record<string, string> = {
  DONG_SAN: "Động sản",
  BAT_DONG_SAN: "Bất động sản",
  KHOAN_NO: "Khoản nợ",
  TAI_SAN_KHAC: "Tài sản khác",
  HOP_DONG_MOI: "Hợp đồng mới",
  HOP_DONG_SUA_DOI_BO_SUNG: "Hợp đồng sửa đổi bổ sung",
  TAI_SAN_THI_HANH_AN: "Tài sản thi hành án",
  TAI_SAN_CONG: "Tài sản công",
  TAI_SAN_CUA_TO_CHUC_TIN_DUNG: "Tài sản của tổ chức tín dụng",
  TAI_SAN_CUA_CAC_BEN_KHAC: "Tài sản của các bên khác",
  MOI: "Mới",
  DANG_DAU_GIA: "Đang đấu giá",
  DAU_GIA_KHONG_THANH: "Đấu giá không thành",
  DAU_GIA_THANH: "Đấu giá thành",
  DA_HUY: "Đã hủy",
  DA_THANH_LY: "Đã thanh lý",
  ADMIN: "Quản trị viên",
  DAU_GIA_VIEN: "Đấu giá viên",
  THU_KY: "Thư ký",
  CHUYEN_VIEN: "Chuyên viên",
  NHAN_VIEN_LUU_TRU: "Nhân viên lưu trữ",
};

function Primitive({ name, value }: { name: string; value: unknown }) {
  let shown =
    value === null || value === undefined || value === "" ? "—" : String(value);
  if (enumLabels[shown]) shown = enumLabels[shown];
  else if (isDateKey(name) && value) {
    shown = formatDate(
      String(value),
      name === "contractDate" ? false : undefined,
    );
  } else if (isMoneyKey(name) && value !== null && value !== undefined) {
    shown = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(value));
  } else if (typeof value === "boolean") shown = value ? "Có" : "Không";
  return (
    <div
      className={cn(
        "min-w-0 py-2",
        (name.toLowerCase().includes("note") ||
          name === "description" ||
          name === "propertyLocation") &&
          "sm:col-span-2",
      )}
    >
      <dt className="text-sm text-muted-foreground">{label(name)}</dt>
      <dd
        className={cn(
          "mt-1.5 whitespace-pre-wrap break-words text-sm font-medium leading-relaxed",
          isMoneyKey(name) && "text-base tabular-nums",
        )}
      >
        {name === "contractStatus" ? <StatusBadge value={value} /> : shown}
      </dd>
    </div>
  );
}

function ObjectDetails({
  value,
  title,
  hideIds = true,
  hiddenFields = new Set<string>(),
}: {
  value: unknown;
  title?: string;
  hideIds?: boolean;
  hiddenFields?: Set<string>;
}) {
  if (Array.isArray(value)) {
    return (
      <div className="space-y-4">
        {value.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Chưa có {label(title ?? "dữ liệu").toLowerCase()}.
          </p>
        ) : (
          value.map((item, index) => (
            <section
              key={
                item && typeof item === "object" && "id" in item
                  ? String(item.id)
                  : index
              }
              className="overflow-hidden rounded-xl border bg-background"
            >
              <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <h3 className="text-sm font-semibold">
                  {label(title ?? "Mục")} {index + 1}
                </h3>
              </div>
              <div className="p-4">
                <ObjectDetails
                  value={item}
                  hideIds={hideIds}
                  hiddenFields={hiddenFields}
                />
              </div>
            </section>
          ))
        )}
      </div>
    );
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([key]) =>
        normalizedKey(key) !== "files" &&
        !hiddenFields.has(normalizedKey(key)) &&
        !shouldHideField(key, hideIds),
    );
    const primitiveEntries = entries.filter(
      ([, child]) => !child || typeof child !== "object",
    );
    const nestedEntries = entries.filter(
      ([, child]) => child && typeof child === "object",
    );
    return (
      <div className="space-y-5">
        {primitiveEntries.length > 0 && (
          <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {primitiveEntries.map(([key, child]) => (
              <Primitive key={key} name={key} value={child} />
            ))}
          </dl>
        )}
        {nestedEntries.map(([key, child]) => (
          <section key={key} className="space-y-3">
            {/* A property link is just a wrapper around the asset itself. */}
            {key !== "property" && (
              <h3 className="border-b pb-2 text-sm font-semibold">
                {label(key)}
              </h3>
            )}
            <ObjectDetails
              value={child}
              title={key}
              hideIds={hideIds}
              hiddenFields={hiddenFields}
            />
          </section>
        ))}
        {entries.length === 0 && (
          <p className="text-sm text-muted-foreground">Chưa có thông tin.</p>
        )}
      </div>
    );
  }
  return (
    <dl>
      <Primitive name={title ?? "Giá trị"} value={value} />
    </dl>
  );
}

function DetailSections({
  item,
  resource,
}: {
  item: ResourceItem;
  resource: ResourceName;
}) {
  const entries = Object.entries(item).filter(
    ([key]) =>
      key !== "files" &&
      !shouldHideField(key, true) &&
      !(
        resource === "auction-result" &&
        ["winningPrice", "auctionCost", "finalPrice"].includes(key)
      ),
  );
  const primitiveEntries = entries.filter(
    ([, value]) => !value || typeof value !== "object",
  );
  const groups = [
    {
      title: "Thông tin chung",
      description: "Thông tin cơ bản của hồ sơ",
      icon: Info,
      entries: primitiveEntries.filter(
        ([key]) => !isMoneyKey(key) && !isDateKey(key),
      ),
    },
    {
      title: "Thông tin tài chính",
      description: "Giá trị và các khoản tiền liên quan",
      icon: Wallet,
      entries: primitiveEntries.filter(([key]) => isMoneyKey(key)),
    },
    {
      title: "Thời gian",
      description: "Các mốc thời gian cần theo dõi",
      icon: CalendarDays,
      entries: primitiveEntries.filter(([key]) => isDateKey(key)),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 xl:grid-cols-2">
        {groups
          .filter((group) => group.entries.length > 0)
          .map((group, index) => (
            <Card
              key={group.title}
              className={index === 0 ? "xl:col-span-2" : ""}
            >
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-primary/10 p-2 text-primary">
                    <group.icon className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="font-semibold">{group.title}</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {group.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ObjectDetails value={Object.fromEntries(group.entries)} />
              </CardContent>
            </Card>
          ))}
      </div>
      {entries
        .filter(([, value]) => value && typeof value === "object")
        .map(([key, value]) => (
          <Card key={key}>
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Layers className="size-4" aria-hidden="true" />
                </span>
                <h2 className="font-semibold">{label(key)}</h2>
                {Array.isArray(value) && (
                  <Badge variant="secondary" className="ml-auto">
                    {value.length}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ObjectDetails value={value} title={key} />
            </CardContent>
          </Card>
        ))}
    </div>
  );
}

function AuctionFinancialSummary({ item }: { item: ResourceItem }) {
  const winningPrice = Number(item.winningPrice ?? 0);
  const totalCost = auctionCostTotal(item.auctionCost);
  const finalPrice = auctionFinalPrice(item.winningPrice, item.auctionCost);
  const costs = Array.isArray(item.auctionCost)
    ? (item.auctionCost as Record<string, unknown>[])
    : [];

  return (
    <section className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
      <h2 className="font-semibold">Giá trị sau chi phí đấu giá</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-background p-3">
          <p className="text-xs text-muted-foreground">Giá trúng đấu giá</p>
          <p className="mt-1 font-semibold">{formatCurrency(winningPrice)}</p>
        </div>
        <div className="rounded-lg border bg-background p-3">
          <p className="text-xs text-muted-foreground">
            Tổng các chi phí, phụ phí phải trả
          </p>
          <p className="mt-1 font-semibold text-destructive">
            − {formatCurrency(totalCost)}
          </p>
        </div>
        <div className="rounded-lg border border-success/15 bg-success-soft p-3">
          <p className="text-xs text-success">
            Số tiền còn lại sau khi trừ
          </p>
          <p className="mt-1 text-lg font-bold text-success">
            {formatCurrency(finalPrice)}
          </p>
        </div>
      </div>
      {costs.length > 0 && (
        <div className="space-y-2 border-t pt-3">
          {costs.map((cost, index) => (
            <div
              key={`${String(cost.name ?? "cost")}-${index}`}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <span>{String(cost.name ?? `Khoản chi ${index + 1}`)}</span>
              <span className="font-medium">
                {formatCurrency(Number(cost.amount ?? 0))}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function ResourceDetail({
  resource,
  title,
}: {
  resource: ResourceName;
  title: string;
}) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<ResourceItem | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const config = resourceConfigs[resource];

  delete item?.announcements;

  const loadItem = useCallback(async () => {
    try {
      const data = await getResource(resource, Number(params.id));
      setItem(data);
      setError("");
    } catch {
      setError("Không thể tải lại dữ liệu. Vui lòng thử lại.");
    }
  }, [params.id, resource]);

  useEffect(() => {
    let active = true;
    getResource(resource, Number(params.id))
      .then((data) => active && setItem(data))
      .catch(
        (reason: unknown) =>
          active &&
          setError(
            (reason as { response?: { data?: { message?: string } } }).response
              ?.data?.message ?? "Không thể tải dữ liệu.",
          ),
      );
    return () => {
      active = false;
    };
  }, [params.id, resource]);

  const entityType = fileEntityTypes[resource];
  const files = Array.isArray(item?.files) ? (item.files as ManagedFile[]) : [];

  const recordName =
    item &&
    (item.contractNumber ??
      item.propertyName ??
      item.regulationNumber ??
      item.announcementNumber ??
      item.auctionResultNumber ??
      item.fullName);

  return (
    <div className="page-container">
      <Button
        variant="ghost"
        className="-ml-3 text-muted-foreground"
        onClick={() => router.back()}
      >
        <ArrowLeft className="size-4" /> Quay lại danh sách
      </Button>
      <header className="flex flex-col gap-5 rounded-2xl border bg-gradient-to-br from-primary/5 via-card to-card p-5 md:p-7 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="hidden rounded-xl bg-primary/10 p-3 text-primary sm:block">
            <FileText className="size-6" aria-hidden="true" />
          </span>
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h1 className="break-words text-2xl font-bold tracking-tight md:text-3xl">
              {recordName ? String(recordName) : title}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              {item && (
                <span className="text-xs text-muted-foreground">
                  Mã hồ sơ #{item.id}
                </span>
              )}
              {item?.contractStatus != null && (
                <StatusBadge value={item.contractStatus} />
              )}
            </div>
          </div>
        </div>
        <Button
          className="shrink-0"
          disabled={!item || Boolean(error)}
          onClick={() => setEditing(true)}
        >
          <Pencil className="size-4" /> Chỉnh sửa
        </Button>
      </header>
      {error ? (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-xl border bg-card p-8 text-center"
        >
          <CircleAlert className="size-8 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" onClick={() => void loadItem()}>
            <RefreshCw className="size-4" /> Thử lại
          </Button>
        </div>
      ) : item ? (
        <>
          {resource === "auction-result" && (
            <AuctionFinancialSummary item={item} />
          )}
          <DetailSections item={item} resource={resource} />
        </>
      ) : (
        <div
          role="status"
          aria-label="Đang tải thông tin"
          className="space-y-6"
        >
          <span className="sr-only">Đang tải thông tin...</span>
          {[0, 1].map((index) => (
            <div key={index} className="space-y-5 rounded-xl border p-6">
              <Skeleton className="h-6 w-48" />
              <div className="grid gap-5 sm:grid-cols-2">
                {[0, 1, 2, 3].map((field) => (
                  <Skeleton key={field} className="h-12 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {item && entityType && (
        <FileSection
          entityType={entityType}
          entityId={item.id}
          files={files}
          onChanged={loadItem}
        />
      )}
      {editing && item && (
        <ResourceFormDialog
          resource={resource}
          singular={config.singular}
          fields={config.fields}
          editing={item}
          onClose={() => setEditing(false)}
          onSaved={loadItem}
        />
      )}
    </div>
  );
}
