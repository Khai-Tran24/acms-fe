"use client";

import AppSideBar from "@/components/custom/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Sheet, User } from "lucide-react";
import React from "react";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  // const { open, setOpen } = useSidebar();

  const adminSidebarItems = [
    {
      icon: <LayoutDashboard size={32} />,
      label: "Dashboard",
      href: "/admin/dashboard",
      isActive: true,
    },
    {
      icon: <User size={32} />,
      label: "Quản lý người dùng",
      href: "/admin/user",
      isActive: false,
    },
    {
      icon: <Sheet size={32} />,
      label: "Quản lý hợp đồng",
      href: "/admin/contract",
      isActive: false,
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
