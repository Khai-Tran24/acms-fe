"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getResource } from "@/lib/api/resource/resource.api";
import { ResourceItem, ResourceName } from "@/lib/types/resource.type";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const labels: Record<string, string> = {
  id: "ID",
  contractNumber: "Số hợp đồng",
  contractName: "Tên hợp đồng",
  contractType: "Loại hợp đồng",
  contractYear: "Năm hợp đồng",
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
  contractProperties: "Hợp đồng sử dụng tài sản",
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
  ].includes(key);

function Primitive({ name, value }: { name: string; value: unknown }) {
  let shown =
    value === null || value === undefined || value === "" ? "—" : String(value);
  const enumLabels: Record<string, string> = {
    DONG_SAN: "Động sản",
    BAT_DONG_SAN: "Bất động sản",
    KHOAN_NO: "Khoản nợ",
    TAI_SAN_KHAC: "Tài sản khác",
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
}: {
  value: unknown;
  title?: string;
  depth?: number;
}) {
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
              child && typeof child === "object" ? (
                <div
                  key={key}
                  className="sm:col-span-2 rounded-lg border bg-background p-4"
                >
                  <ObjectDetails value={child} title={key} depth={depth + 1} />
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
            <ObjectDetails value={item} />
          ) : (
            <p className="text-muted-foreground">Đang tải...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
