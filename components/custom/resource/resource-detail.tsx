"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getResource } from "@/lib/api/resource/resource.api";
import { ResourceItem, ResourceName } from "@/lib/types/resource.type";
import { ArrowLeft } from "lucide-react";
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
  contractName: "Tên hợp đồng",
  contractType: "Loại hợp đồng",
  contractOwnerType: "Nhóm chủ sở hữu tài sản",
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
  customer: "Khách hàng",
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
  contractProperties: "Tài sản trong hợp đồng",
  property: "Tài sản",
  amount: "Số tiền",
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
  ].includes(key);

const hiddenDetailFields = new Set([
  // "assignedto",
  // "createby",
  // "createdby",
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

function Primitive({ name, value }: { name: string; value: unknown }) {
  let shown =
    value === null || value === undefined || value === "" ? "—" : String(value);
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
    TAM_DUNG: "Tạm dừng",
    DA_THANH_LY: "Đã thanh lý",
  };
  if (enumLabels[shown]) shown = enumLabels[shown];
  else if (isDateKey(name) && value) {
    const date = new Date(String(value));
    if (!Number.isNaN(date.getTime())) shown = date.toLocaleString("vi-VN");
  } else if (isMoneyKey(name) && value !== null && value !== undefined) {
    shown = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(value));
  } else if (typeof value === "boolean") shown = value ? "Có" : "Không";
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label(name)}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium">{shown}</dd>
    </div>
  );
}

function ObjectDetails({
  value,
  title,
  depth = 0,
  hideIds = false,
  hiddenFields = new Set<string>(),
}: {
  value: unknown;
  title?: string;
  depth?: number;
  hideIds?: boolean;
  hiddenFields?: Set<string>;
}) {
  const hideNestedIds =
    hideIds || normalizedKey(title ?? "") === "contractproperties";

  if (Array.isArray(value))
    return (
      <section className="space-y-3">
        {title && <h3 className="font-semibold">{label(title)}</h3>}
        {value.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không có dữ liệu</p>
        ) : (
          value.map((item, index) => (
            <div key={index} className="rounded-lg border p-3">
              <ObjectDetails
                value={item}
                title={`${title ?? "Mục"} ${index + 1}`}
                depth={depth + 1}
                hideIds={hideNestedIds}
                hiddenFields={hiddenFields}
              />
            </div>
          ))
        )}
      </section>
    );
  if (value && typeof value === "object")
    return (
      <section className="space-y-3">
        {title && (
          <h3
            className={
              depth ? "text-sm font-semibold" : "text-lg font-semibold"
            }
          >
            {label(title)}
          </h3>
        )}
        <dl className="grid gap-3 sm:grid-cols-2">
          {Object.entries(value as Record<string, unknown>).map(
            ([key, child]) =>
              normalizedKey(key) === "files" ||
              hiddenFields.has(normalizedKey(key)) ||
              shouldHideField(key, hideNestedIds) ? null : child &&
                typeof child === "object" ? (
                <div
                  key={key}
                  className="sm:col-span-2 rounded-lg border bg-background p-4"
                >
                  <ObjectDetails
                    value={child}
                    title={key}
                    depth={depth + 1}
                    hideIds={hideNestedIds}
                    hiddenFields={hiddenFields}
                  />
                </div>
              ) : (
                <Primitive key={key} name={key} value={child} />
              ),
          )}
        </dl>
      </section>
    );
  return <Primitive name={title ?? "Giá trị"} value={value} />;
}

function AuctionFinancialSummary({ item }: { item: ResourceItem }) {
  const winningPrice = Number(item.winningPrice ?? 0);
  const totalCost = auctionCostTotal(item.auctionCost);
  const finalPrice = auctionFinalPrice(item.winningPrice, item.auctionCost);
  const costs = Array.isArray(item.auctionCost)
    ? (item.auctionCost as Record<string, unknown>[])
    : [];

  return (
    <section className="mb-5 space-y-3 rounded-xl border bg-muted/20 p-4">
      <h3 className="font-semibold">Giá trị sau chi phí đấu giá</h3>
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
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-xs text-emerald-700">Số tiền còn lại sau khi trừ</p>
          <p className="mt-1 text-lg font-bold text-emerald-700">
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

  const loadItem = useCallback(async () => {
    const data = await getResource(resource, Number(params.id));
    setItem(data);
    setError("");
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

  return (
    <div className="space-y-4 p-4 md:p-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 size-4" />
        Quay lại
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-destructive">{error}</p>
          ) : item ? (
            <>
              {resource === "auction-result" && (
                <AuctionFinancialSummary item={item} />
              )}
              <ObjectDetails
                value={item}
                hiddenFields={
                  resource === "auction-result"
                    ? new Set(["winningprice", "auctioncost"])
                    : undefined
                }
              />
            </>
          ) : (
            <p className="text-muted-foreground">Đang tải...</p>
          )}
        </CardContent>
      </Card>
      {item && entityType && (
        <FileSection
          entityType={entityType}
          entityId={item.id}
          files={files}
          onChanged={loadItem}
        />
      )}
    </div>
  );
}
