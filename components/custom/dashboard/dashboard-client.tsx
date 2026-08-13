"use client";

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
  Bar,
  BarChart,
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
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
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
const STATUS_LABELS: Record<string, string> = {
  MOI: "Mới",
  DANG_DAU_GIA: "Đang đấu giá",
  DAU_GIA_THANH: "Đấu giá thành",
  DAU_GIA_KHONG_THANH: "Không thành",
  TAM_DUNG: "Tạm dừng",
  DA_THANH_LY: "Đã thanh lý",
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
  contractsOverTime: [],
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
  <Card className={`border-slate-200 shadow-sm ${className}`}>
    <CardHeader className="pb-2">
      <CardTitle className="text-base font-semibold text-slate-900">
        {title}
      </CardTitle>
      <p className="text-xs text-slate-500">{subtitle}</p>
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

  // The effect synchronizes the selected reporting range with the remote API.
  // eslint-disable-next-line react-hooks/set-state-in-effect
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
      color: "bg-blue-50 text-blue-700",
      note: `${Math.abs(data.summary.growthRate)}% so với tháng trước`,
      growth: data.summary.growthRate,
    },
    {
      label: "Tổng giá trị đấu giá thành công",
      value: VND.format(data.summary.totalSuccessfulValue),
      icon: CircleDollarSign,
      color: "bg-emerald-50 text-emerald-700",
      note: "Giá trị trúng đấu giá",
      growth: null,
    },
    {
      label: "Tỷ lệ đấu giá thành công",
      value: `${data.summary.successRate}%`,
      icon: Trophy,
      color: "bg-violet-50 text-violet-700",
      note: "Trên tổng số hồ sơ",
      growth: null,
    },
    {
      label: "Hồ sơ đang xử lý",
      value: NUMBER.format(data.summary.inProgressFiles),
      icon: FileClock,
      color: "bg-amber-50 text-amber-700",
      note: "Cần tiếp tục theo dõi",
      growth: null,
    },
  ];

  if (loading && data === EMPTY)
    return (
      <div className="space-y-5 p-4 md:p-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );

  return (
    <div className="min-h-full p-4 md:p-6 ">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
              Bảng điều hành đấu giá
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Theo dõi hồ sơ, giá trị và hiệu suất xử lý tập trung.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => void load()}
            disabled={loading}
            className="bg-white"
          >
            <RefreshCw className={loading ? "animate-spin" : ""} /> Làm mới dữ
            liệu
          </Button>
        </div>
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, icon: Icon, color, note, growth }) => (
            <Card
              key={label}
              className="border-slate-200 shadow-sm transition-shadow hover:shadow-md"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className={`rounded-xl p-2.5 ${color}`}>
                    <Icon className="size-5" />
                  </div>
                  {growth !== null && (
                    <Badge
                      variant="secondary"
                      className={
                        growth >= 0
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }
                    >
                      {growth >= 0 ? <ArrowUpRight /> : <ArrowDownRight />}
                      {Math.abs(growth)}%
                    </Badge>
                  )}
                </div>
                <p className="mt-4 text-sm text-slate-500">{label}</p>
                <p
                  className="mt-1 truncate text-2xl font-bold text-slate-950"
                  title={value}
                >
                  {value}
                </p>
                {label === "Tỷ lệ đấu giá thành công" && (
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-violet-600"
                      style={{
                        width: `${Math.min(data.summary.successRate, 100)}%`,
                      }}
                    />
                  </div>
                )}
                <p className="mt-2 text-xs text-slate-400">{note}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Panel
            title="Xu hướng đấu giá"
            subtitle="Giá trị đấu giá thành công và số lượng hồ sơ"
          >
            <div className="mb-3 flex justify-end gap-1">
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
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="period"
                  tickFormatter={formatPeriod}
                  fontSize={11}
                />
                <YAxis
                  yAxisId="value"
                  tickFormatter={(v) => COMPACT.format(v)}
                  fontSize={11}
                />
                <YAxis
                  yAxisId="count"
                  orientation="right"
                  allowDecimals={false}
                  fontSize={11}
                />
                <Tooltip
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
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fill="url(#valueFill)"
                />
                <Line
                  yAxisId="count"
                  type="monotone"
                  dataKey="fileCount"
                  stroke="#f59e0b"
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
            title="Thống kê hợp đồng dịch vụ đấu giá"
            subtitle="Số lượng và giá trị hợp đồng trong 12 tháng"
            className="xl:col-span-2"
          >
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data.contractsOverTime}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="period"
                  tickFormatter={formatPeriod}
                  fontSize={11}
                />
                <YAxis yAxisId="count" allowDecimals={false} fontSize={11} />
                <YAxis
                  yAxisId="value"
                  orientation="right"
                  tickFormatter={(v) => COMPACT.format(v)}
                  fontSize={11}
                />
                <Tooltip
                  labelFormatter={(value) => formatPeriod(String(value))}
                  formatter={(v, name) =>
                    name === "auctionValue"
                      ? [VND.format(Number(v)), "Giá trị"]
                      : [NUMBER.format(Number(v)), "Hợp đồng"]
                  }
                />
                <Legend
                  formatter={(v) =>
                    v === "auctionValue" ? "Giá trị hợp đồng" : "Số hợp đồng"
                  }
                />
                <Bar
                  yAxisId="count"
                  dataKey="fileCount"
                  fill="#2563eb"
                  radius={[5, 5, 0, 0]}
                />
                <Bar
                  yAxisId="value"
                  dataKey="auctionValue"
                  fill="#93c5fd"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
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
              <thead className="border-y bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
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
                    <tr key={row.id} className="hover:bg-slate-50">
                      <Td>{row.id}</Td>
                      <Td strong>{row.fileCode}</Td>
                      <Td>{row.assetName}</Td>
                      <Td>{DATE.format(new Date(row.createdDate))}</Td>
                      <Td>
                        <Badge variant="secondary">
                          {STATUS_LABELS[row.status] ?? row.status}
                        </Badge>
                      </Td>
                      <Td>{row.assignedOfficer}</Td>
                    </tr>
                  ))}
                {activeTable === "liquidated" &&
                  data.liquidatedFiles.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
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
                    <tr key={row.id} className="hover:bg-slate-50">
                      <Td>{row.id}</Td>
                      <Td strong>{row.officerName}</Td>
                      <Td>{NUMBER.format(row.handledFiles)}</Td>
                      <Td>{VND.format(row.totalValue)}</Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full bg-emerald-500"
                              style={{
                                width: `${Math.min(row.completionRate, 100)}%`,
                              }}
                            />
                          </div>
                          {row.completionRate}%
                        </div>
                      </Td>
                      <Td>
                        <Badge className="bg-amber-50 text-amber-700">
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
              <p className="py-10 text-center text-sm text-slate-500">
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
    className={`px-4 py-3.5 ${strong ? "font-semibold text-slate-900" : "text-slate-600"}`}
  >
    {children}
  </td>
);

export default DashboardClient;
