import { RoleEnum } from "../enums/role.enum";

export interface UserData {
  id: string;
  email: string;
  username: string;
  role: RoleEnum;
  isActive: boolean;
  avatar?: string;
}

export interface UserDetails extends UserData {
  createdAt: string;
  updatedAt: string;
}

export interface GetUsersQuery {
  search?: string;
  filterByRole?: RoleEnum;
  filterByStatus?: boolean;
  sortBy?: "username" | "email" | "createdAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
