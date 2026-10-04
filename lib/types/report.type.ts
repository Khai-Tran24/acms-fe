import { ContractStatus } from "../enums/contract.enum";
import { Pagination } from "./reponse.type";

export interface ContractReportQuery {
  search?: string;
  contractNumber?: string;
  contractType?: string;
  contractOwnerType?: string;
  contractStatus?: ContractStatus;
  assignedToId?: number;
  createdById?: number;
  propertyId?: number;
  createdFrom?: string;
  createdTo?: string;
  sortBy?:
    | "id"
    | "contractNumber"
    | "contractType"
    | "contractOwnerType"
    | "contractDate"
    | "contractStatus"
    | "startingPrice"
    | "stepPrice"
    | "createdAt"
    | "updatedAt";
  sortOrder?: "ASC" | "DESC";
  contractDateFrom?: string;
  contractDateTo?: string;
  page?: number;
  limit?: number;
}

export interface ContractReport {
  summary: {
    totalContracts: number;
    successfulContracts: number;
    successRate: number;
    totalStartingPrice: number;
    totalWinningPrice: number;
  };
  statusBreakdown: { status: ContractStatus; count: number }[];
  items: {
    id: number;
    contractNumber: string;
    contractDate: string | null;
    contractStatus: ContractStatus;
    propertyNames: string[];
    assignedOfficer: string | null;
    startingPrice: number;
    winningPrice: number | null;
  }[];
  pagination: Pagination;
}
