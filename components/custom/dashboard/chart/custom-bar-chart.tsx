"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartData } from "@/lib/types/analytic.type";

const CustomBarChart = ({
  chartData,
  isLoading = false,
}: {
  chartData: ChartData["contractsOverTime"];
  isLoading?: boolean;
}) => {
  const data = chartData.labels.map((label, index) => ({
    label,
    contracts: chartData.data[index] ?? 0,
  }));

  const chartConfig = {
    contracts: {
      label: "Hồ sơ",
      color: "#3b82f6", // Tailwind blue-500
    },
  } satisfies ChartConfig;

  if (isLoading) {
    return (
      <div className="flex min-h-50 items-center justify-center text-sm text-muted-foreground">
        Đang tải biểu đồ...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex min-h-50 items-center justify-center text-sm text-muted-foreground">
        Chưa có dữ liệu.
      </div>
    );
  }

  return (
    <ChartContainer className="min-h-50 max-h-100 w-full" config={chartConfig}>
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="label"
          tickLine={false}
          tickMargin={8}
        />
        <YAxis axisLine={false} tickLine={false} tickMargin={8} />
        <Bar dataKey="contracts" fill="var(--color-contracts)" radius={4} />
        <ChartTooltip content={<ChartTooltipContent />} />
      </BarChart>
    </ChartContainer>
  );
};

export default CustomBarChart;
