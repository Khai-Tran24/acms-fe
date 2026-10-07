"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, RefreshCw } from "lucide-react";
import { ContractStatusBadge } from "@/components/custom/contract/contract-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUpcomingAuctions } from "@/lib/api/analytics/analytics.api";
import { UpcomingAuction } from "@/lib/types/analytic.type";

const auctionDate = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function UpcomingAuctions() {
  const pathname = usePathname();
  const basePath = pathname.startsWith("/admin") ? "/admin" : "";
  const [items, setItems] = useState<UpcomingAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getUpcomingAuctions()
      .then((result) => {
        if (!cancelled) setItems(result);
      })
      .catch(() => {
        if (!cancelled)
          setError("Không thể tải lịch đấu giá. Vui lòng thử lại.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [revision]);

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-start justify-between gap-3 border-b">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarClock className="size-5 text-primary" /> Cuộc đấu sắp diễn
            ra
          </CardTitle>
          <p className="mt-2 text-xs text-muted-foreground">
            10 cuộc đấu sắp diễn ra gần nhất theo ngày đấu giá trong quy chế,
            hiển thị theo giờ Việt Nam.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Sử dụng quy chế mới nhất; loại trừ hợp đồng “Đấu giá thành” và “Đã thanh lý”.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => {
            setLoading(true);
            setError("");
            setRevision((value) => value + 1);
          }}
        >
          <RefreshCw className={loading ? "animate-spin" : ""} />{" "}
          {error ? "Thử lại" : "Làm mới lịch"}
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <p role="alert" className="py-8 text-center text-sm text-destructive">
            {error}
          </p>
        ) : (
          <Table aria-busy={loading}>
            <TableHeader>
              <TableRow>
                <TableHead>Hợp đồng</TableHead>
                <TableHead>Tài sản</TableHead>
                <TableHead>Ngày đấu giá</TableHead>
                <TableHead>Hạn đăng ký</TableHead>
                <TableHead>Người phụ trách</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-28 text-center"
                    role="status"
                  >
                    Đang tải lịch đấu giá...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-28 text-center text-muted-foreground"
                  >
                    Chưa có cuộc đấu nào sắp diễn ra.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link
                        href={`${basePath}/contracts/${item.id}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        {item.contractNumber || `Hợp đồng #${item.id}`}
                      </Link>
                    </TableCell>
                    <TableCell className="min-w-48 max-w-80 whitespace-normal">
                      {item.assetName}
                    </TableCell>
                    <TableCell className="font-semibold tabular-nums">
                      <time dateTime={item.auctionDate}>
                        {auctionDate.format(new Date(item.auctionDate))}
                      </time>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      <time dateTime={item.endRegisterDate}>
                        {auctionDate.format(new Date(item.endRegisterDate))}
                      </time>
                    </TableCell>
                    <TableCell>{item.assignedOfficer}</TableCell>
                    <TableCell>
                      <ContractStatusBadge value={item.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
