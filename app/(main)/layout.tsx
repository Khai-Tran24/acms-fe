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

export default function MainLayout({
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
          href: "/dashboard",
          isActive: active("/dashboard"),
        },
      ],
    },
    {
      group: "Danh bạ",
      items: [
        {
          icon: <Users />,
          label: "Thành viên",
          href: "/members",
          isActive: active("/members"),
        },
      ],
    },
    {
      group: "Quản lý nghiệp vụ",
      items: [
        {
          icon: <ScrollText />,
          label: "Hợp đồng",
          href: "/contracts",
          isActive: active("/contracts"),
        },
        {
          icon: <Building2 />,
          label: "Tài sản",
          href: "/properties",
          isActive: active("/properties"),
        },
        {
          icon: <Gavel />,
          label: "Quy chế",
          href: "/regulations",
          isActive: active("/regulations"),
        },
        {
          icon: <Megaphone />,
          label: "Thông báo",
          href: "/announcements",
          isActive: active("/announcements"),
        },
        {
          icon: <FileCheck2 />,
          label: "Thanh lý hợp đồng",
          href: "/auction-results",
          isActive: active("/auction-results"),
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
