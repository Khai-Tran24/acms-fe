"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { useAuth } from "../context/auth-context";
import { RoleEnum } from "../enums/role.enum";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const path = usePathname();
  const restrictedPaths = useMemo(
    () => ["/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/"],
    [],
  );

  const naviagateByRole = useCallback(
    (role: RoleEnum) => {
      switch (role) {
        case RoleEnum.ADMIN:
          router.push("/admin/dashboard");
          break;
        case RoleEnum.AUCTIONEER:
        case RoleEnum.SECRETARY:
          router.push("/contracts");
          break;
        default:
          router.push("/sign-in");
      }
    },
    [router],
  );

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      if (!restrictedPaths.includes(path)) {
        router.push("/sign-in");
      }
      return;
    }

    if (restrictedPaths.includes(path) && token && user?.role) {
      naviagateByRole(user.role);
    }
  }, [path, router, user, naviagateByRole, restrictedPaths]);

  return children;
}
