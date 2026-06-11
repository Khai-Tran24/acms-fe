import { ContractStatusEnum } from "@/lib/enums/contract.enum";
import { ContractData } from "@/lib/types/contract.type";
import { UserData } from "@/lib/types/user.type";

export const CONTRACT_STATUS_LABELS: Record<ContractStatusEnum, string> = {
  [ContractStatusEnum.MOI]: "Mới",
  [ContractStatusEnum.DANG_THUC_HIEN]: "Đang thực hiện",
  [ContractStatusEnum.HET_HAN]: "Hết hạn",
  [ContractStatusEnum.DANG_THANH_LY]: "Đang thanh lý",
  [ContractStatusEnum.THANH_LY]: "Thanh lý",
  [ContractStatusEnum.TAM_DUNG]: "Tạm dừng",
  [ContractStatusEnum.HUY]: "Hủy",
};

export const getStatusClassName = (status: ContractStatusEnum) => {
  switch (status) {
    case ContractStatusEnum.MOI:
      return "bg-emerald-100 text-emerald-800";
    case ContractStatusEnum.DANG_THUC_HIEN:
      return "bg-blue-100 text-blue-800";
    case ContractStatusEnum.HET_HAN:
      return "bg-amber-100 text-amber-800";
    case ContractStatusEnum.DANG_THANH_LY:
      return "bg-violet-100 text-violet-800";
    case ContractStatusEnum.THANH_LY:
      return "bg-slate-200 text-slate-800";
    case ContractStatusEnum.TAM_DUNG:
      return "bg-orange-100 text-orange-800";
    case ContractStatusEnum.HUY:
      return "bg-red-100 text-red-800";
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
  return value.slice(0, 10);
};

export const getContractDefaults = (contract?: ContractData) => ({
  regulationNumber: contract?.regulationNumber ?? "",
  title: contract?.title ?? "",
  description: contract?.description ?? "",
  startingPrice: contract?.startingPrice ?? 0,
  applicationFee: contract?.applicationFee ?? 0,
  deposit: contract?.deposit ?? 0,
  registerStartDate: toDateInputValue(contract?.registerStartDate),
  registerExpiredDate: toDateInputValue(contract?.registerExpiredDate),
  auctionDate: toDateInputValue(contract?.auctionDate),
  auctionTime: contract?.auctionTime ?? 0,
  status: contract?.status ?? ContractStatusEnum.MOI,
  fileUrl: contract?.fileUrl ?? "",
  auctioneer: getUserId(contract?.auctioneer),
  secretary: getUserId(contract?.secretary),
});
