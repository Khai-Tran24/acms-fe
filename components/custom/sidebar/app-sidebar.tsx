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
  useSidebar,
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
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-6">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-3">
            <div className="shrink-0 rounded-2xl border border-sidebar-border bg-white p-1.5 shadow-sm">
              <Image src={Logo} alt="Trung tâm Dịch vụ Đấu giá Tài sản" className="size-10 object-contain" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Hệ thống quản lý</p>
              <p className="mt-1 text-base font-semibold leading-snug text-sidebar-accent-foreground">Hồ sơ đấu giá</p>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-2 px-2 py-4">
        {items.map((group, index) => (
          <SidebarGroup key={index}>
            <SidebarGroupLabel className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{group.group}</SidebarGroupLabel>
            <SidebarMenu className="gap-1.5">
              {group.items.map((item, itemIndex) => (
                <SidebarMenuItem key={itemIndex}>
                  <SidebarMenuButton
                    key={itemIndex}
                    isActive={item.isActive}
                    className="h-11 rounded-xl px-3 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent/65 data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold data-[active=true]:text-sidebar-accent-foreground data-[active=true]:shadow-[inset_3px_0_0_var(--sidebar-primary)]"
                    asChild
                  >
                    <Link
                      href={item.href}
                      aria-current={item.isActive ? "page" : undefined}
                      onClick={() => { if (isMobile) setOpenMobile(false); }}
                      className="flex w-full items-center gap-3"
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
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
