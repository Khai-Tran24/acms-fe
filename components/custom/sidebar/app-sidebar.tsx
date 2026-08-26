"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/assets/logo.png";

type SidebarItem = {
  group: string;
  items: {
    icon: React.ReactNode;
    label: string;
    href: string;
    isActive: boolean;
  }[];
};

const AppSidebar = ({ items }: { items: SidebarItem[] }) => {
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <Image src={Logo} alt="Logo" className="h-12 w-12" />
            <p className="text-base font-semibold">
              Hệ thống quản lý hồ sơ đấu giá
            </p>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {items.map((group, index) => (
          <SidebarGroup key={index}>
            <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item, itemIndex) => (
                <SidebarMenuItem key={itemIndex}>
                  <SidebarMenuButton
                    key={itemIndex}
                    isActive={item.isActive}
                    asChild
                  >
                    <Link
                      href={item.href}
                      className="flex w-full items-center gap-2"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
