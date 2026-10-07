"use client";

import { useAuth } from "@/lib/context/auth-context";
import { RoleEnum } from "@/lib/enums/role.enum";
import { ResourceManager } from "./resource-manager";
import { resourceConfigs } from "./resource-fields";

export function AuctionRegistrationPage() {
  const { user } = useAuth();
  if (!user) return null;
  if (
    user.role !== RoleEnum.ADMIN &&
    user.role !== RoleEnum.REGISTRATION_STAFF
  ) {
    return (
      <p role="alert" className="page-container">
        Bạn không có quyền truy cập trang đăng ký đấu giá.
      </p>
    );
  }
  return (
    <ResourceManager
      resource="auction-registration"
      title="Đăng ký đấu giá"
      {...resourceConfigs["auction-registration"]}
    />
  );
}
