import { RoleEnum } from "../enums/role.enum";

export interface UserData{
  id: string;
  email: string;
  username: string;
  role: RoleEnum;
  isActive: boolean;
}