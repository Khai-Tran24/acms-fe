"use client";

import { AppHeader } from "@/components/custom/layout/app-header";
import AppSideBar from "@/components/custom/sidebar/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { FileCheck2, Gavel, ScrollText } from "lucide-react";
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
      group: "Quản lý nghiệp vụ",
      items: [
        {
          icon: <ScrollText />,
          label: "Hợp đồng",
          href: "/contracts",
          isActive: active("/contracts"),
        },
        // {
        //   icon: <Building2 />,
        //   label: "Tài sản",
        //   href: "/properties",
        //   isActive: active("/properties"),
        // },
        {
          icon: <Gavel />,
          label: "Quy chế",
          href: "/regulations",
          isActive: active("/regulations"),
        },
        // {
        //   icon: <Megaphone />,
        //   label: "Thông báo",
        //   href: "/announcements",
        //   isActive: active("/announcements"),
        // },
        {
          icon: <FileCheck2 />,
          label: "Kết quả đấu giá",
          href: "/auction-results",
          isActive: active("/auction-results"),
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
