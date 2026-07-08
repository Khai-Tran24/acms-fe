"use client";

import AppSideBar from "@/components/custom/sidebar/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Sheet } from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const adminSidebarItems = [
    {
      icon: <LayoutDashboard size={32} />,
      label: "Thống kê",
      href: "/dashboard",
      isActive: pathname === "/dashboard",
    },
    {
      icon: <Sheet size={32} />,
      label: "Quản lý hợp đồng",
      href: "/contracts",
      isActive: pathname === "/contracts",
    },
  ];

  return (
    <SidebarProvider>
      <AppSideBar items={adminSidebarItems} />
      <SidebarInset>
        <main>
          <SidebarTrigger />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;
