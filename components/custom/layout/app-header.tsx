"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ChevronRight, PanelsTopLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const pageNames: Record<string, string> = {
  dashboard: "Thống kê",
  reports: "Báo cáo",
  contracts: "Hợp đồng",
  properties: "Tài sản",
  regulations: "Quy chế",
  announcements: "Thông báo",
  "auction-results": "Kết quả đấu giá",
  users: "Người dùng",
  members: "Danh bạ thành viên",
  account: "Tài khoản",
};

export function AppHeader() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const isAdmin = segments[0] === "admin";
  const moduleIndex = isAdmin ? 1 : 0;
  const moduleName = segments[moduleIndex];
  const title = pageNames[moduleName] ?? "Không gian làm việc";
  const isDetail = segments.length > moduleIndex + 1;
  const moduleHref = `/${segments.slice(0, moduleIndex + 1).join("/")}`;

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-card/95 px-4 backdrop-blur-md md:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger className="size-9 shrink-0 rounded-lg border border-border bg-card text-muted-foreground" />
        <span className="h-5 w-px bg-border" aria-hidden="true" />
        <nav aria-label="Đường dẫn trang" className="min-w-0">
          <ol className="flex min-w-0 items-center gap-2 text-sm">
            <li className="hidden text-muted-foreground lg:block">
              {isAdmin ? "Quản trị hệ thống" : "Không gian làm việc"}
            </li>
            <li className="hidden lg:block" aria-hidden="true"><ChevronRight className="size-3.5 text-muted-foreground/60" /></li>
            <li className="truncate font-medium">
              {isDetail ? <Link className="text-muted-foreground transition-colors hover:text-primary" href={moduleHref}>{title}</Link> : <span aria-current="page">{title}</span>}
            </li>
            {isDetail && (
              <>
                <li aria-hidden="true"><ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" /></li>
                <li className="shrink-0 font-medium" aria-current="page">Chi tiết</li>
              </>
            )}
          </ol>
        </nav>
      </div>
      <div className="hidden shrink-0 items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary md:flex">
        <PanelsTopLeft className="size-3.5" aria-hidden="true" />
        Quản lý hồ sơ đấu giá
      </div>
    </header>
  );
}
