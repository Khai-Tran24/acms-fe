"use client";

import CustomBarChart from "@/components/custom/dashboard/chart/custom-bar-chart";
import CustomPieChart from "@/components/custom/dashboard/chart/custom-pie-chart";
import { ContractTable } from "@/components/custom/dashboard/contract-table";
import CardSection from "@/components/custom/section/card-section";
import {
  CONTRACT_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
} from "@/components/custom/contract/contract-utils";
import { Button } from "@/components/ui/button";
import getAnalyticsApi, {
  AnalyticsParams,
} from "@/lib/api/analytics/analytics.api";
import { ContractStatus, PaymentStatus } from "@/lib/enums/contract.enum";
import { AnalyticsData, ChartData } from "@/lib/types/analytic.type";
import {
  CircleCheck,
  Clock,
  CreditCard,
  RotateCcw,
  ScrollText,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CalendarInput } from "@/components/custom/input/calendar-input";

const DEFAULT_ANALYTICS: AnalyticsData = {
  summary: {
    contracts: {
      totalContracts: 0,
      contractsByStatus: {},
      contractsByPropertyType: {},
      contractsByPaymentStatus: {},
    },
    users: {
      activeUsers: 0,
      inactiveUsers: 0,
    },
  },
  chart: {
    contractsOverTime: {
      labels: [],
      data: [],
    },
    percentageOfContractsByStatus: {
      labels: [],
      data: [],
    },
    percentageOfContractsByPropertyType: {
      labels: [],
      data: [],
    },
    percentageOfContractsByPaymentStatus: {
      labels: [],
      data: [],
    },
  },
  recentContracts: [],
};

const formatChartLabels = (
  chartData: ChartData["percentageOfContractsByStatus"],
  labels: Partial<Record<string, string>>,
) => ({
  ...chartData,
  keys: chartData.labels,
  labels: chartData.labels.map((label) => labels[label] ?? label),
});

const DashboardClient = ({
  initialParams,
}: {
  initialParams: AnalyticsParams;
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData>(DEFAULT_ANALYTICS);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [startDate, setStartDate] = useState(initialParams.startDate);
  const [endDate, setEndDate] = useState(initialParams.endDate);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getAnalyticsApi({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });

        if (!response.success) {
          throw new Error(response.message || "Failed to fetch dashboard data");
        }

        setAnalytics(response.data ?? DEFAULT_ANALYTICS);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setErrorMessage("Có lỗi xảy ra khi tải dữ liệu thống kê.");
        setAnalytics(DEFAULT_ANALYTICS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [endDate, startDate]);

  const combineStatusCounts = (
    statusCounts: Record<string, number>,
    statusesToCombine: string[],
  ) => {
    return statusesToCombine.reduce((total, status) => {
      return total + (statusCounts[status] || 0);
    }, 0);
  };

  const cardData = useMemo(
    () => [
      {
        title: "Tổng số hồ sơ",
        value: analytics.summary.contracts.totalContracts,
        icon: <ScrollText className="text-blue-700" />,
        className: "bg-blue-100",
      },
      {
        title: "Đang đấu giá",
        value: combineStatusCounts(
          analytics.summary.contracts.contractsByStatus,
          [ContractStatus.DANG_DAU_GIA, ContractStatus.MOI],
        ),
        icon: <Clock className="text-amber-700" />,
        className: "bg-amber-100",
      },
      {
        title: "Hồ sơ đã hoàn thành",
        value: combineStatusCounts(
          analytics.summary.contracts.contractsByStatus,
          [ContractStatus.DAU_GIA_THANH, ContractStatus.DA_THANH_LY],
        ),
        icon: <CircleCheck className="text-emerald-700" />,
        className: "bg-emerald-100",
      },
      {
        title: "Hồ sơ không thành",
        value: combineStatusCounts(
          analytics.summary.contracts.contractsByStatus,
          [ContractStatus.DAU_GIA_KHONG_THANH, ContractStatus.TAM_DUNG],
        ),
        icon: <CreditCard className="text-red-700" />,
        className: "bg-red-100",
      },
    ],
    [analytics],
  );

  const statusChartData = useMemo(
    () =>
      formatChartLabels(
        analytics.chart.percentageOfContractsByStatus,
        CONTRACT_STATUS_LABELS,
      ),
    [analytics.chart.percentageOfContractsByStatus],
  );

  const propertyTypeChartData = useMemo(
    () =>
      formatChartLabels(
        analytics.chart.percentageOfContractsByPropertyType,
        PROPERTY_TYPE_LABELS,
      ),
    [analytics.chart.percentageOfContractsByPropertyType],
  );

  const paymentStatusChartData = useMemo(
    () =>
      formatChartLabels(
        analytics.chart.percentageOfContractsByPaymentStatus,
        PAYMENT_STATUS_LABELS,
      ),
    [analytics.chart.percentageOfContractsByPaymentStatus],
  );

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bảng thống kê</h1>
          {errorMessage && (
            <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
          )}
        </div>

        <form className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]">
          <CalendarInput
            placeholder="Ngày bắt đầu"
            date={startDate as string}
            onDateChange={setStartDate}
          />

          <CalendarInput
            placeholder="Ngày kết thúc"
            date={endDate as string}
            onDateChange={setEndDate}
          />
          {/* <Button type="submit" disabled={isLoading}>
            Lọc
          </Button> */}
          <Button
            variant="outline"
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
          >
            <RotateCcw />
            Reset
          </Button>
        </form>
      </div>

      <div className="mb-4 grid gap-4 md:grid-cols-4">
        {cardData.map((data) => (
          <CardSection key={data.title} data={data} />
        ))}
      </div>

      <div className="mb-4 grid gap-4">
        <div className="rounded-lg bg-white p-4 ring-1 ring-foreground/10">
          <p className="mb-2 text-lg font-bold">
            Thống kê số lượng hồ sơ theo tháng
          </p>
          <CustomBarChart
            chartData={analytics.chart.contractsOverTime}
            isLoading={isLoading}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-4 ring-1 ring-foreground/10">
            <p className="mb-2 text-lg font-bold">Tình trạng hồ sơ</p>
            <CustomPieChart chartData={statusChartData} isLoading={isLoading} />
          </div>
          <div className="rounded-lg bg-white p-4 ring-1 ring-foreground/10">
            <p className="mb-2 text-lg font-bold">Loại tài sản</p>
            <CustomPieChart
              chartData={propertyTypeChartData}
              isLoading={isLoading}
            />
          </div>
          <div className="rounded-lg bg-white p-4 ring-1 ring-foreground/10">
            <p className="mb-2 text-lg font-bold">Trạng thái thanh toán</p>
            <CustomPieChart
              chartData={paymentStatusChartData}
              isLoading={isLoading}
            />
            /
          </div>
        </div>
      </div>
      <ContractTable
        contracts={analytics.recentContracts}
        isLoading={isLoading}
      />
    </div>
  );
};

export default DashboardClient;
