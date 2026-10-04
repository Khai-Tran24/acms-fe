"use client";

import { UpcomingAuctions } from "./upcoming-auctions";
import { PageHeading } from "@/components/custom/layout/page-heading";
import { ContractStatusBadge } from "@/components/custom/contract/contract-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardData } from "@/lib/api/analytics/analytics.api";
import { DashboardData, DashboardTimeframe } from "@/lib/types/analytic.type";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CircleDollarSign,
  FileClock,
  Files,
  RefreshCw,
  Trophy,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const VND = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});
const NUMBER = new Intl.NumberFormat("vi-VN");
const DATE = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const COMPACT = new Intl.NumberFormat("vi-VN", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--info)",
];
const ASSET_LABELS: Record<string, string> = {
  BAT_DONG_SAN: "Bất động sản",
  DONG_SAN: "Động sản",
  KHOAN_NO: "Khoản nợ",
  PHUONG_TIEN: "Phương tiện",
  MAY_MOC_THIET_BI: "Máy móc, thiết bị",
  CHUNG_KHOAN: "Chứng khoán",
  TAI_SAN_KHAC: "Tài sản khác",
};
const CONTRACT_OWNER_LABELS: Record<string, string> = {
  TAI_SAN_THI_HANH_AN: "Tài sản thi hành án",
  TAI_SAN_CONG: "Tài sản công",
  TAI_SAN_CUA_TO_CHUC_TIN_DUNG: "Tài sản của tổ chức tín dụng",
  TAI_SAN_CUA_CAC_BEN_KHAC: "Tài sản của các bên khác",
  UNKNOWN: "Chưa xác định",
};

const EMPTY: DashboardData = {
  summary: {
    totalFiles: 0,
    totalSuccessfulValue: 0,
    successRate: 0,
    inProgressFiles: 0,
    growthRate: 0,
  },
  trends: [],
  assetBreakdown: [],
  contractOwnerBreakdown: [],
  recentFiles: [],
  liquidatedFiles: [],
  topOfficers: [],
};

const formatPeriod = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("vi-VN", { month: "short", year: "2-digit" });
};

const Panel = ({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <Card className={`border-border shadow-sm ${className}`}>
    <CardHeader className="border-b pb-4">
      <CardTitle className="text-base font-semibold text-foreground">
        {title}
      </CardTitle>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const DashboardClient = () => {
  const [data, setData] = useState(EMPTY);
  const [timeframe, setTimeframe] = useState<DashboardTimeframe>("12m");
  const [activeTable, setActiveTable] = useState<
    "recent" | "liquidated" | "officers"
  >("recent");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await getDashboardData(timeframe));
    } catch (cause) {
      console.error(cause);
      setError("Không thể tải dữ liệu thống kê. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    const loader = async () => {
      void load();
    };
    void loader();
  }, [load]);

  const cards = [
    {
      label: "Tổng số hồ sơ",
      value: NUMBER.format(data.summary.totalFiles),
      icon: Files,
      color: "bg-info-soft text-info",
      note: `${Math.abs(data.summary.growthRate)}% so với tháng trước`,
      growth: data.summary.growthRate,
    },
    {
      label: "Tổng giá trị đấu giá thành công",
      value: VND.format(data.summary.totalSuccessfulValue),
      icon: CircleDollarSign,
      color: "bg-success-soft text-success",
      note: "Giá trị trúng đấu giá",
      growth: null,
    },
    {
      label: "Tỷ lệ đấu giá thành công",
      value: `${data.summary.successRate}%`,
      icon: Trophy,
      color: "bg-lavender-soft text-lavender",
      note: "Trên tổng số hồ sơ",
      growth: null,
    },
    {
      label: "Hồ sơ đang xử lý",
      value: NUMBER.format(data.summary.inProgressFiles),
      icon: FileClock,
      color: "bg-warning-soft text-warning",
      note: "Cần tiếp tục theo dõi",
      growth: null,
    },
  ];

  if (loading && data === EMPTY)
    return (
      <div className="page-container">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );

  return (
    <div className="page-container">
      <div className="space-y-6">
        <PageHeading
          title="Bảng điều hành đấu giá"
          description="Theo dõi hồ sơ, giá trị và hiệu suất xử lý tập trung."
          icon={<Activity aria-hidden="true" />}
          actions={
            <>
              <Button
                variant="outline"
                onClick={() => void load()}
                disabled={loading}
              >
                <RefreshCw className={loading ? "animate-spin" : ""} /> Làm mới
              </Button>
            </>
          }
        />
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/20 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, icon: Icon, color, note, growth }) => (
            <Card
              key={label}
              className="relative border-border bg-gradient-to-br from-card to-muted/40"
            >
              <CardContent>
                <div className="flex items-start justify-between gap-3">
                  <div className={`rounded-xl p-2.5 ${color}`}>
                    <Icon className="size-5" />
                  </div>
                  {growth !== null && (
                    <Badge
                      variant="secondary"
                      className={
                        growth >= 0
                          ? "bg-success-soft text-success"
                          : "bg-destructive/10 text-destructive"
                      }
                    >
                      {growth >= 0 ? <ArrowUpRight /> : <ArrowDownRight />}
                      {Math.abs(growth)}%
                    </Badge>
                  )}
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{label}</p>
                <p
                  className="mt-1 break-words text-2xl font-semibold tracking-tight text-foreground tabular-nums"
                  title={value}
                >
                  {value}
                </p>
                {label === "Tỷ lệ đấu giá thành công" && (
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-lavender"
                      style={{
                        width: `${Math.min(data.summary.successRate, 100)}%`,
                      }}
                    />
                  </div>
                )}
                <p className="mt-2 text-xs text-muted-foreground">{note}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <UpcomingAuctions />
          <Panel
            title="Xu hướng đấu giá"
            subtitle="Giá trị đấu giá thành công và số lượng hồ sơ"
          >
            <div className="mb-5 flex flex-wrap justify-end gap-1">
              {(["30d", "6m", "12m", "year"] as DashboardTimeframe[]).map(
                (item) => (
                  <Button
                    key={item}
                    size="sm"
                    variant={timeframe === item ? "default" : "ghost"}
                    onClick={() => setTimeframe(item)}
                  >
                    {
                      {
                        "30d": "30 ngày",
                        "6m": "6 tháng",
                        "12m": "12 tháng",
                        year: "Năm nay",
                      }[item]
                    }
                  </Button>
                ),
              )}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.trends}>
                <defs>
                  <linearGradient id="valueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--chart-1)"
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--chart-1)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="period"
                  tickFormatter={formatPeriod}
                  fontSize={11}
                  tick={{ fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="value"
                  tickFormatter={(v) => COMPACT.format(v)}
                  fontSize={11}
                  tick={{ fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="count"
                  orientation="right"
                  allowDecimals={false}
                  fontSize={11}
                  tick={{ fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--popover)",
                    color: "var(--popover-foreground)",
                  }}
                  itemStyle={{ color: "var(--popover-foreground)" }}
                  labelFormatter={(value) => formatPeriod(String(value))}
                  formatter={(v, name) =>
                    name === "auctionValue"
                      ? [VND.format(Number(v)), "Giá trị"]
                      : [NUMBER.format(Number(v)), "Hồ sơ"]
                  }
                />
                <Legend
                  formatter={(v) =>
                    v === "auctionValue" ? "Giá trị đấu giá" : "Số hồ sơ"
                  }
                />
                <Area
                  yAxisId="value"
                  type="monotone"
                  dataKey="auctionValue"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  fill="url(#valueFill)"
                />
                <Line
                  yAxisId="count"
                  type="monotone"
                  dataKey="fileCount"
                  stroke="var(--chart-3)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Panel>

          <Panel
            title="Cơ cấu hồ sơ theo loại tài sản"
            subtitle="Phân bổ theo số lượng hồ sơ"
          >
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={data.assetBreakdown}
                  dataKey="fileCount"
                  nameKey="assetType"
                  cx="50%"
                  cy="45%"
                  innerRadius={72}
                  outerRadius={112}
                  paddingAngle={3}
                >
                  {data.assetBreakdown.map((item, index) => (
                    <Cell
                      key={item.assetType}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--popover)",
                    color: "var(--popover-foreground)",
                  }}
                  itemStyle={{ color: "var(--popover-foreground)" }}
                  formatter={(v) => [
                    `${NUMBER.format(Number(v))} hồ sơ`,
                    "Số lượng",
                  ]}
                  labelFormatter={(v) => ASSET_LABELS[String(v)] ?? v}
                />
                <Legend formatter={(v) => ASSET_LABELS[v] ?? v} />
              </PieChart>
            </ResponsiveContainer>
          </Panel>
          <Panel
            title="Cơ cấu hợp đồng theo nhóm chủ sở hữu tài sản"
            subtitle="Phân bổ theo số lượng hợp đồng"
          >
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={data.contractOwnerBreakdown.map((item) => ({
                    ...item,
                    ownerType: item.ownerType ?? "UNKNOWN",
                  }))}
                  dataKey="fileCount"
                  nameKey="ownerType"
                  cx="50%"
                  cy="45%"
                  innerRadius={72}
                  outerRadius={112}
                  paddingAngle={3}
                >
                  {data.contractOwnerBreakdown.map((item, index) => (
                    <Cell
                      key={item.ownerType ?? "UNKNOWN"}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--popover)",
                    color: "var(--popover-foreground)",
                  }}
                  itemStyle={{ color: "var(--popover-foreground)" }}
                  formatter={(v) => [
                    `${NUMBER.format(Number(v))} hợp đồng`,
                    "Số lượng",
                  ]}
                  labelFormatter={(v) => CONTRACT_OWNER_LABELS[String(v)] ?? v}
                />
                <Legend formatter={(v) => CONTRACT_OWNER_LABELS[v] ?? v} />
              </PieChart>
            </ResponsiveContainer>
          </Panel>
        </div>

        <Panel
          title="Danh sách điều hành"
          subtitle="Các hồ sơ và nhân sự cần quan tâm gần đây"
        >
          <div className="mb-4 flex flex-wrap gap-2">
            {(
              [
                {
                  key: "recent",
                  label: "Hồ sơ mới nhất",
                  icon: BriefcaseBusiness,
                },
                {
                  key: "liquidated",
                  label: "Hồ sơ vừa thanh lý",
                  icon: Activity,
                },
                {
                  key: "officers",
                  label: "Đấu giá viên nổi bật",
                  icon: Trophy,
                },
              ] as const
            ).map((tab) => (
              <Button
                key={tab.key}
                variant={activeTable === tab.key ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTable(tab.key)}
              >
                <tab.icon />
                {tab.label}
              </Button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-y bg-muted/65 text-xs text-muted-foreground">
                {activeTable === "recent" && (
                  <tr>
                    <Th>ID</Th>
                    <Th>Mã hồ sơ</Th>
                    <Th>Tài sản</Th>
                    <Th>Ngày tạo</Th>
                    <Th>Trạng thái</Th>
                    <Th>Chuyên viên</Th>
                  </tr>
                )}
                {activeTable === "liquidated" && (
                  <tr>
                    <Th>ID</Th>
                    <Th>Mã hồ sơ</Th>
                    <Th>Giá khởi điểm</Th>
                    <Th>Giá trúng</Th>
                    <Th>Đấu giá viên</Th>
                    <Th>Ngày thanh lý</Th>
                  </tr>
                )}
                {activeTable === "officers" && (
                  <tr>
                    <Th>ID</Th>
                    <Th>Đấu giá viên</Th>
                    <Th>Hồ sơ xử lý</Th>
                    <Th>Tổng giá trị</Th>
                    <Th>Tỷ lệ hoàn thành</Th>
                    <Th>Xếp hạng</Th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y">
                {activeTable === "recent" &&
                  data.recentFiles.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/50">
                      <Td>{row.id}</Td>
                      <Td strong>{row.fileCode}</Td>
                      <Td>{row.assetName}</Td>
                      <Td>{DATE.format(new Date(row.createdDate))}</Td>
                      <Td>
                        <ContractStatusBadge value={row.status} />
                      </Td>
                      <Td>{row.assignedOfficer}</Td>
                    </tr>
                  ))}
                {activeTable === "liquidated" &&
                  data.liquidatedFiles.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/50">
                      <Td>{row.id}</Td>
                      <Td strong>{row.fileCode}</Td>
                      <Td>{VND.format(row.startingPrice)}</Td>
                      <Td strong>{VND.format(row.winningPrice)}</Td>
                      <Td>{row.auctioneer}</Td>
                      <Td>{DATE.format(new Date(row.liquidationDate))}</Td>
                    </tr>
                  ))}
                {activeTable === "officers" &&
                  data.topOfficers.map((row, index) => (
                    <tr key={row.id} className="hover:bg-muted/50">
                      <Td>{row.id}</Td>
                      <Td strong>{row.officerName}</Td>
                      <Td>{NUMBER.format(row.handledFiles)}</Td>
                      <Td>{VND.format(row.totalValue)}</Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-success"
                              style={{
                                width: `${Math.min(row.completionRate, 100)}%`,
                              }}
                            />
                          </div>
                          {row.completionRate}%
                        </div>
                      </Td>
                      <Td>
                        <Badge className="bg-warning-soft text-warning">
                          #{index + 1}
                        </Badge>
                      </Td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {((activeTable === "recent" && !data.recentFiles.length) ||
              (activeTable === "liquidated" && !data.liquidatedFiles.length) ||
              (activeTable === "officers" && !data.topOfficers.length)) && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Chưa có dữ liệu phù hợp.
              </p>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
};

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="px-4 py-3 font-semibold">{children}</th>
);
const Td = ({
  children,
  strong = false,
}: {
  children: React.ReactNode;
  strong?: boolean;
}) => (
  <td
    className={`px-4 py-3.5 ${strong ? "font-semibold text-foreground" : "text-muted-foreground"}`}
  >
    {children}
  </td>
);

export default DashboardClient;
