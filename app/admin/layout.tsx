"use client";

import { AppHeader } from "@/components/custom/layout/app-header";
import AppSideBar from "@/components/custom/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  FileCheck2,
  Gavel,
  IdCard,
  LayoutDashboard,
  ScrollText,
  SquareChartGantt,
  Users,
} from "lucide-react";
import { useAuth } from "@/lib/context/auth-context";
import { RoleEnum } from "@/lib/enums/role.enum";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const active = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
  const items = [
    {
      group: "Tổng quan",
      items: [
        {
          icon: <LayoutDashboard />,
          label: "Thống kê",
          href: "/admin/dashboard",
          isActive: active("/admin/dashboard"),
        },
        {
          icon: <SquareChartGantt />,
          label: "Báo cáo",
          href: "/admin/reports",
          isActive: active("/admin/reports"),
        },
      ],
    },
    {
      group: "Quản trị",
      items: [
        {
          icon: <Users />,
          label: "Người dùng",
          href: "/admin/users",
          isActive: active("/admin/users"),
        },
      ],
    },
    {
      group: "Quản lý nghiệp vụ",
      items: [
        {
          icon: <ScrollText />,
          label: "Hợp đồng",
          href: "/admin/contracts",
          isActive: active("/admin/contracts"),
        },
        // {
        //   icon: <Building2 />,
        //   label: "Tài sản",
        //   href: "/admin/properties",
        //   isActive: active("/admin/properties"),
        // },
        {
          icon: <Gavel />,
          label: "Quy chế",
          href: "/admin/regulations",
          isActive: active("/admin/regulations"),
        },
        // {
        //   icon: <Megaphone />,
        //   label: "Thông báo",
        //   href: "/admin/announcements",
        //   isActive: active("/admin/announcements"),
        // },
        ...(user?.role === RoleEnum.ADMIN ||
        user?.role === RoleEnum.REGISTRATION_STAFF
          ? [
              {
                icon: <IdCard />,
                label: "Đăng ký đấu giá",
                href: "/admin/auction-registrations",
                isActive: active("/admin/auction-registrations"),
              },
            ]
          : []),
        {
          icon: <FileCheck2 />,
          label: "Kết quả đấu giá",
          href: "/admin/auction-results",
          isActive: active("/admin/auction-results"),
        },
      ],
    },
  ];
  return (
    <SidebarProvider>
      <AppSideBar items={items} />
      <SidebarInset className="min-w-0 overflow-clip ring-1 ring-border/70">
        <AppHeader />
        <div className="min-w-0 flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
