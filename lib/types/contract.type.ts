import { ContractStatusEnum } from "../enums/contract.enum";
import { UserData } from "./user.type";

export interface ContractPayload {
  regulationNumber: string;
  title: string;
  description?: string | null | undefined;
  startingPrice: number;
  applicationFee: number;
  deposit: number;
  registerStartDate: string;
  registerExpiredDate: string;
  auctionDate: string;
  auctionTime: number;
  status: ContractStatusEnum;
  fileUrl?: string;
  auctioneer: string;
  secretary: string;
}

export interface ContractData {
  id: string;
  regulationNumber: string;
  title: string;
  description?: string | null | undefined;
  startingPrice: number;
  applicationFee: number;
  deposit: number;
  registerStartDate: string;
  registerExpiredDate: string;
  auctionDate: string;
  auctionTime: number;
  status: ContractStatusEnum;
  fileUrl?: string;
  auctioneer: UserData;
  secretary: UserData;
  createdBy?: UserData;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetContractsQuery {
  search?: string;
  sortBy?: "username" | "email" | "createdAt";
  sortOrder?: "asc" | "desc";
  filterByUserId?: string;
  startRegisterDate?: string;
  endRegisterDate?: string;
  auctionDate?: string;
  page?: number;
  limit?: number;
}
