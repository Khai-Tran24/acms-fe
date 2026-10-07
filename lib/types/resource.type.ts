import { Pagination } from "./reponse.type";
import { ContractStatus } from "../enums/contract.enum";

export type ResourceName =
  | "contract"
  | "property"
  | "user"
  | "regulation"
  | "announcement"
  | "auction-result"
  | "auction-registration";

export interface ResourceItem {
  id: number;
  [key: string]: unknown;
}

export interface ResourceList {
  items: ResourceItem[];
  pagination: Pagination;
}

export interface ResourceQuery {
  page?: number;
  limit?: number;
  search?: string;
  contractStatus?: ContractStatus;
  selectableOnly?: boolean;
  contractType?: string;
  sortOrder?: "ASC" | "DESC";
}
