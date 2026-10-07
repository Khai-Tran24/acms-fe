"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChartNoAxesCombined, Download, RefreshCw } from "lucide-react";
import CustomPagination from "@/components/custom/custom-pagination";
import { PageHeading } from "@/components/custom/layout/page-heading";
import { ContractStatusBadge } from "@/components/custom/contract/contract-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { getContractReport } from "@/lib/api/contract/report.api";
import { exportContractsToExcel } from "@/lib/api/contract/contract.api";
import { formatDate } from "@/lib/helper/date-formatter.helper";
import { formatCurrency } from "@/lib/helper/currency-exchange.helper";
import { useToast } from "@/lib/hooks/use-toast";
import { ContractReport, ContractReportQuery } from "@/lib/types/report.type";

import { ContractReportFilters } from "./contract-report-filters";

export default function ContractReportPage() {
  const toast = useToast();
  const [query, setQuery] = useState<ContractReportQuery>({
    page: 1,
    limit: 10,
  });
  const [report, setReport] = useState<ContractReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getContractReport(query)
      .then((result) => {
        if (!cancelled) setReport(result);
      })
      .catch(() => {
        if (!cancelled) setError("Không thể tải báo cáo. Vui lòng thử lại.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query, revision]);

  const refresh = () => {
    setLoading(true);
    setError("");
    setRevision((current) => current + 1);
  };
  const changeQuery = (next: ContractReportQuery) => {
    setLoading(true);
    setError("");
    setReport(null);
    setQuery(next);
  };
  const exportReport = async () => {
    setExporting(true);
    try {
      // Export all contracts matching the applied filters, not only this page.
      const exportQuery = { ...query };
      delete exportQuery.page;
      delete exportQuery.limit;
      const blob = await exportContractsToExcel(exportQuery);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "bao-cao-hop-dong.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      toast.success("Đã xuất dữ liệu hợp đồng theo bộ lọc báo cáo.");
    } catch {
      toast.error("Không thể xuất báo cáo. Vui lòng thử lại.");
    } finally {
      setExporting(false);
    }
  };

  const cards = report
    ? [
        {
          label: "Tổng số hợp đồng",
          value: report.summary.totalContracts.toLocaleString("vi-VN"),
          note: "Theo bộ lọc đang áp dụng",
        },
        {
          label: "Tổng giá khởi điểm",
          value: formatCurrency(report.summary.totalStartingPrice),
          note: "Cộng một lần cho mỗi hợp đồng",
        },
        {
          label: "Tổng giá trúng đấu giá",
          value: formatCurrency(report.summary.totalWinningPrice),
          note: "Kết quả mới nhất của mỗi hợp đồng",
        },
        {
          label: "Tỷ lệ đấu giá thành",
          value: `${report.summary.successRate}%`,
          note: `${report.summary.successfulContracts} hợp đồng đấu giá thành hoặc đã thanh lý`,
        },
      ]
    : [];

  return (
    <div className="page-container space-y-6">
      <PageHeading
        title="Báo cáo hợp đồng"
        description="Tổng hợp số lượng, trạng thái và giá trị hợp đồng theo ngày ký."
        icon={<ChartNoAxesCombined aria-hidden="true" />}
        actions={
          <>
            <Button variant="outline" onClick={refresh} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : ""} /> Làm mới
            </Button>
            <Button
              onClick={() => void exportReport()}
              disabled={
                exporting ||
                loading ||
                !!error ||
                !report?.summary.totalContracts
              }
            >
              <Download /> {exporting ? "Đang xuất..." : "Xuất dữ liệu"}
            </Button>
          </>
        }
      />
      <ContractReportFilters
        onApply={(filters) =>
          changeQuery({ ...filters, page: 1, limit: query.limit })
        }
      />
      {error ? (
        <div role="alert" className="surface-panel p-6 text-center">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" className="mt-3" onClick={refresh}>
            Thử lại
          </Button>
        </div>
      ) : loading ? (
        <div role="status" aria-label="Đang tải báo cáo" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((key) => (
              <Skeleton key={key} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-72" />
        </div>
      ) : (
        report && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {cards.map((card) => (
                <Card key={card.label}>
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground">
                      {card.label}
                    </p>
                    <p className="mt-3 break-words text-2xl font-semibold tabular-nums">
                      {card.value}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {card.note}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <section className="surface-panel p-5">
              <h2 className="text-base font-semibold">
                Phân bổ trạng thái hợp đồng
              </h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {report.statusBreakdown.map((group) => (
                  <div key={group.status}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <ContractStatusBadge value={group.status} />
                      <span className="text-sm font-semibold tabular-nums">
                        {group.count.toLocaleString("vi-VN")}
                      </span>
                    </div>
                    <div
                      className="h-2 overflow-hidden rounded-full bg-muted"
                      aria-hidden="true"
                    >
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${report.summary.totalContracts ? (group.count / report.summary.totalContracts) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className="surface-panel space-y-4 p-5">
              <div>
                <h2 className="text-base font-semibold">Chi tiết hợp đồng</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Giá trúng lấy từ kết quả đấu giá mới nhất theo ngày hoàn tất.
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Số hợp đồng</TableHead>
                    <TableHead>Ngày ký</TableHead>
                    <TableHead>Tài sản</TableHead>
                    <TableHead>Người phụ trách</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Giá khởi điểm</TableHead>
                    <TableHead className="text-right">Giá trúng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.items.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-32 text-center text-muted-foreground"
                      >
                        Không có hợp đồng phù hợp với bộ lọc.
                      </TableCell>
                    </TableRow>
                  ) : (
                    report.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Link
                            className="font-semibold text-primary hover:underline"
                            href={`/admin/contracts/${item.id}`}
                          >
                            {item.contractNumber || `Hợp đồng #${item.id}`}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {formatDate(item.contractDate, false)}
                        </TableCell>
                        <TableCell className="min-w-48 max-w-80 whitespace-normal">
                          {item.propertyNames.join(", ") || "Chưa có tài sản"}
                        </TableCell>
                        <TableCell>
                          {item.assignedOfficer || "Chưa phân công"}
                        </TableCell>
                        <TableCell>
                          <ContractStatusBadge value={item.contractStatus} />
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(item.startingPrice)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {item.winningPrice === null
                            ? "Chưa có kết quả"
                            : formatCurrency(item.winningPrice)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <CustomPagination
                currentPage={report.pagination.page}
                pageSize={report.pagination.limit}
                totalItems={report.pagination.totalItems}
                totalPages={report.pagination.totalPages}
                onPageChange={(page) => changeQuery({ ...query, page })}
                onPageSizeChange={(limit) =>
                  changeQuery({ ...query, page: 1, limit })
                }
              />
            </section>
          </>
        )
      )}
    </div>
  );
}
