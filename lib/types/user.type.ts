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
