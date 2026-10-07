import {
  AUCTION_FORMAT_LABELS,
  AUCTION_METHOD_LABELS,
} from "@/lib/enums/contract.enum";
import { formatDate } from "@/lib/helper/date-formatter.helper";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContractStatusBadge as StatusBadge } from "@/components/custom/contract/contract-status-badge";
import { CalendarDays, Info, Layers, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResourceItem, ResourceName } from "@/lib/types/resource.type";

const labels: Record<string, string> = {
  id: "ID",
  contractNumber: "Số hợp đồng",
  contractType: "Loại hợp đồng",
  parentContractId: "Mã hợp đồng cha",
  parentContract: "Hợp đồng cha",
  childContracts: "Hợp đồng sửa đổi bổ sung",
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
  auctionFormat: "Hình thức đấu giá",
  auctionMethod: "Phương thức đấu giá",
  winningPrice: "Giá trúng",
  auctionCost: "Chi phí đấu giá",
  completedAt: "Thời gian hoàn tất",
  winner: "Người trúng đấu giá",
  identityNumber: "Số CCCD",
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
  ...AUCTION_FORMAT_LABELS,
  ...AUCTION_METHOD_LABELS,
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
  NHAN_VIEN_BAN_HO_SO: "Nhân viên bán hồ sơ",
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
          "mt-1.5 whitespace-pre-wrap wrap-break-wordbreak-words text-sm font-medium leading-relaxed",
          isMoneyKey(name) && "text-base tabular-nums",
        )}
      >
        {name === "contractStatus" ? <StatusBadge value={value} /> : shown}
      </dd>
    </div>
  );
}

export function ObjectDetails({
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

export function DetailSections({
  item,
  resource,
}: {
  item: ResourceItem;
  resource: ResourceName;
}) {
  const entries = Object.entries(item).filter(
    ([key]) =>
      key !== "files" &&
      !(
        resource === "contract" &&
        ["parentContractId", "parentContract", "childContracts"].includes(key)
      ) &&
      !shouldHideField(key, true) &&
      !(
        resource === "auction-result" &&
        [
          "startingPrice",
          "winningPrice",
          "auctionCost",
          "finalPrice",
          "priceGap",
        ].includes(key)
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
