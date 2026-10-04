"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Gavel } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-gradient-to-br from-secondary via-background to-background p-5">
      <div className="w-full max-w-xl space-y-6 rounded-2xl border bg-card p-8 text-center shadow-sm sm:p-12">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Gavel className="size-8" aria-hidden="true" /></span>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Không gian làm việc tập trung</p>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight">Hệ thống quản lý<br />hồ sơ đấu giá</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">Đăng nhập để theo dõi hợp đồng, quy chế và kết quả đấu giá.</p>
        </div>
        <Button asChild size="lg"><Link href="/sign-in">Đăng nhập <ArrowRight className="size-4" /></Link></Button>
      </div>
    </main>
  );
}
