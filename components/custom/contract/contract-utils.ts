import {
  ContractStatus,
  PaymentStatus,
  PropertyType,
} from "@/lib/enums/contract.enum";
import { ContractPayload } from "@/lib/types/contract.type";
import { UserData } from "@/lib/types/user.type";

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  [ContractStatus.MOI]: "Mới",
  [ContractStatus.DANG_DAU_GIA]: "Đang đấu giá",
  [ContractStatus.DAU_GIA_KHONG_THANH]: "Đấu giá không thành",
  [ContractStatus.DAU_GIA_THANH]: "Đấu giá thành",
  [ContractStatus.TAM_DUNG]: "Tạm dừng",
  [ContractStatus.DA_THANH_LY]: "Đã thanh lý",
};

export const getStatusClassName = (status: ContractStatus) => {
  switch (status) {
    case ContractStatus.MOI:
      return "bg-emerald-100 text-emerald-800";
    case ContractStatus.DANG_DAU_GIA:
      return "bg-blue-100 text-blue-800";
    case ContractStatus.DAU_GIA_KHONG_THANH:
      return "bg-amber-100 text-amber-800";
    case ContractStatus.DA_THANH_LY:
      return "bg-violet-100 text-violet-800";
    case ContractStatus.DAU_GIA_THANH:
      return "bg-emerald-100 text-emerald-800";
    case ContractStatus.TAM_DUNG:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  [PropertyType.DONG_SAN]: "Động sản",
  [PropertyType.BAT_DONG_SAN]: "Bất động sản",
  [PropertyType.KHOAN_NO]: "Khoản nợ",
  [PropertyType.TAI_SAN_KHAC]: "Tài sản khác",
};

export const getPropertyTypeClassName = (propertyType: PropertyType) => {
  switch (propertyType) {
    case PropertyType.DONG_SAN:
      return "bg-blue-100 text-blue-800";
    case PropertyType.BAT_DONG_SAN:
      return "bg-green-100 text-green-800";
    case PropertyType.KHOAN_NO:
      return "bg-yellow-100 text-yellow-800";
    case PropertyType.TAI_SAN_KHAC:
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.CHUA_THU_TIEN]: "Chưa thu tiền",
  [PaymentStatus.DA_THU_TIEN]: "Đã thu tiền",
};

export const getPaymentStatusClassName = (paymentStatus: PaymentStatus) => {
  switch (paymentStatus) {
    case PaymentStatus.CHUA_THU_TIEN:
      return "bg-amber-100 text-amber-800";
    case PaymentStatus.DA_THU_TIEN:
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getUserDisplayName = (user?: UserData | string) => {
  if (!user) return "Chưa phân công";
  if (typeof user === "string") return user;
  return user.username || user.email || user.id;
};

export const getUserId = (user?: UserData | string) => {
  if (!user) return "";
  return typeof user === "string" ? user : user.id;
};

export const toDateInputValue = (value?: string) => {
  if (!value) return "";
  return value;
};

export const getContractDefaults = (contract?: ContractPayload) => ({
  contractNumber: contract?.contractNumber ?? "",
  contractDate: contract?.contractDate ?? "",
  propertyName: contract?.propertyName ?? "",
  propertyType: contract?.propertyType ?? PropertyType.DONG_SAN,
  propertyOwner: {
    name: contract?.propertyOwner?.name ?? "",
    phone: contract?.propertyOwner?.phone ?? "",
  },
  caseOfficer: contract?.caseOfficer ?? "",
  startingPrice: contract?.startingPrice ?? 0,
  winningPrice: contract?.winningPrice ?? null,
  // discountPrice: {
  //   amount: contract?.discountPrice?.amount ?? 0,
  //   times: contract?.discountPrice?.times ?? 0,
  // },
  endRegisterDate: contract?.endRegisterDate ?? "",
  auctionDate: contract?.auctionDate ?? "",
  status: contract?.status ?? ContractStatus.MOI,
  winner: {
    name: contract?.winner?.name ?? "",
    phone: contract?.winner?.phone ?? "",
  },
  paymentStatus: contract?.paymentStatus ?? PaymentStatus.CHUA_THU_TIEN,
});
