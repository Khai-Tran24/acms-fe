import {
  ContractStatus,
  PaymentStatus,
  PropertyType,
} from "../enums/contract.enum";
import { Pagination } from "./reponse.type";
import { UserData } from "./user.type";

export interface ContractsResponse {
  items: ContractData[];
  pagination: Pagination;
}

export interface ContractData {
  id: string;
  contractNumber: string;
  contractDate?: Date | string | null;
  propertyName: string;
  propertyType: PropertyType;
  propertyOwner: PropertyOwner;
  caseOfficer: CaseOfficer;
  startingPrice: number;
  winningPrice?: number | null;
  discountPrice?: DiscountPrice[];
  endRegisterDate: Date | string;
  auctionDate: Date | string;
  status: ContractStatus;
  winner?: Winner;
  paymentStatus: PaymentStatus;
  createdBy?: UserData;
  createdAt?: string;
  updatedAt?: string;
}

export type ContractPayload = Omit<
  ContractData,
  | "id"
  | "createdBy"
  | "createdAt"
  | "updatedAt"
  | "caseOfficer"
  | "discountPrice"
> & { caseOfficer: string };

export interface PropertyOwner {
  name: string;
  phone: string;
}

export interface CaseOfficer {
  id?: number;
  username: string;
  email: string;
}

export interface DiscountPrice {
  amount?: number;
  times?: number;
}

export interface Winner {
  name?: string;
  phone?: string;
}

export interface GetContractsQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "year" | "contractNumber" | "propertyName";
  sortOrder?: "asc" | "desc";
  filterByUserId?: string;
  filterByYear?: number;
  endRegisterDate?: string;
  auctionDate?: string;
  contractNumber?: string;
  contractName?: string;
  contractType?: string;
  contractOwnerType?: string;
  contractDateFrom?: string;
  contractDateTo?: string;
  contractStatus?: string;
  assignedToId?: number;
  createdById?: number;
  propertyId?: number;
  createdFrom?: string;
  createdTo?: string;
}
