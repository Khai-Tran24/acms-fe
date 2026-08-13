import { Pagination } from "./reponse.type";

export type ResourceName =
  | "contract"
  | "property"
  | "user"
  | "regulation"
  | "announcement"
  | "auction-result";

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
  sortOrder?: "ASC" | "DESC";
}
