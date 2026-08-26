"use client";

import { BadgeCheck, Bell, ChevronsUpDown, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/context/auth-context";
import Link from "next/link";
import { RoleEnum } from "@/lib/enums/role.enum";
import { useEffect, useState } from "react";
import { UserData } from "@/lib/types/user.type";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user, logout } = useAuth();
  // Keep the server and first client render identical. Profile edits are
  // applied after hydration through the event subscription below.
  const [profile, setProfile] = useState<UserData | null>(null);

  useEffect(() => {
    const update = (event: Event) =>
      setProfile((event as CustomEvent<UserData>).detail);
    window.addEventListener("profile-updated", update);
    return () => window.removeEventListener("profile-updated", update);
  }, []);

  const displayUser = profile ?? user;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={displayUser?.avatar}
                  alt={displayUser?.username}
                />
                <AvatarFallback className="rounded-lg">
                  {displayUser?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {displayUser?.username}
                </span>
                <span className="truncate text-xs">{displayUser?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={displayUser?.avatar}
                    alt={displayUser?.username}
                  />
                  <AvatarFallback className="rounded-lg">
                    {displayUser?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {displayUser?.username}
                  </span>
                  <span className="truncate text-xs">{displayUser?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href={
                    user?.role === RoleEnum.ADMIN
                      ? "/admin/account"
                      : "/account"
                  }
                >
                  <BadgeCheck />
                  Tài khoản
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Thông báo
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
