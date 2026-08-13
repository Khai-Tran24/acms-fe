"use client";

import AppSideBar from "@/components/custom/sidebar/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Building2,
  FileCheck2,
  Gavel,
  LayoutDashboard,
  Megaphone,
  ScrollText,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
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
        {
          icon: <Building2 />,
          label: "Tài sản",
          href: "/admin/properties",
          isActive: active("/admin/properties"),
        },
        {
          icon: <Gavel />,
          label: "Quy chế",
          href: "/admin/regulations",
          isActive: active("/admin/regulations"),
        },
        {
          icon: <Megaphone />,
          label: "Thông báo",
          href: "/admin/announcements",
          isActive: active("/admin/announcements"),
        },
        {
          icon: <FileCheck2 />,
          label: "Thanh lý hợp đồng",
          href: "/admin/auction-results",
          isActive: active("/admin/auction-results"),
        },
      ],
    },
  ];
  return (
    <SidebarProvider>
      <AppSideBar items={items} />
      <SidebarInset>
        <main className="min-w-0">
          <SidebarTrigger className="m-2" />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
