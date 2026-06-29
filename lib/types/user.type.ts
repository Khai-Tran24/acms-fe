import { RoleEnum } from "../enums/role.enum";
import { Pagination } from "./reponse.type";

export interface UserResponse {
  items: UserData[];
  pagination: Pagination;
}

export interface UserData {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  role: RoleEnum;
  refreshToken?: string;
  otpExpireAt: string;
  otp: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  filterByRole?: RoleEnum;
  filterByStatus?: boolean;
  sortBy?: string;
  sortOrder?: string;
}
