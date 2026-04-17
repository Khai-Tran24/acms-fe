"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const AppSidebar = ({
  items,
}: {
  items: {
    label: string;
    href: string;
    isActive: boolean;
    icon: React.ReactNode;
  }[];
}) => {
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex gap-2 items-center">
            {/* <Image src={Logo} alt="Logo" width={40} height={40} /> */}
            {/* <span className="text-lg font-bold">
              Hệ thống quản lý hồ sơ đấu giá
            </span> */}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={item.isActive}>
                <a href={item.href}>
                  {item.icon}
                  {item.label}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
};

export default AppSidebar;
