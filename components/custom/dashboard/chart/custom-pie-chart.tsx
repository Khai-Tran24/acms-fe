"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  CONTRACT_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
} from "@/components/custom/contract/contract-utils";
import {
  ContractStatus,
  PaymentStatus,
  PropertyType,
} from "@/lib/enums/contract.enum";
import { ChartData } from "@/lib/types/analytic.type";
import { Cell, PieChart, Pie } from "recharts";

const contractstatusColorPalette = [
  {
    status: ContractStatus.DANG_DAU_GIA,
    color: "#3b82f6", // Tailwind blue-500
  },
  {
    status: ContractStatus.MOI,
    color: "#10b981", // Tailwind green-500
  },
  {
    status: ContractStatus.TAM_DUNG,
    color: "#ef4444", // Tailwind red-500
  },
  {
    status: ContractStatus.DA_THANH_LY,
    color: "#8b5cf6", // Tailwind violet-500
  },
  {
    status: ContractStatus.DAU_GIA_THANH,
    color: "#14b8a6", // Tailwind teal-500
  },
  {
    status: ContractStatus.DAU_GIA_KHONG_THANH,
    color: "#e11d48", // Tailwind rose-500
  },
];

const paymentStatusColorPallette = [
  {
    status: PaymentStatus.DA_THU_TIEN,
    color: "#10b981", // Tailwind green-500
  },
  {
    status: PaymentStatus.CHUA_THU_TIEN,
    color: "#f59e0b", // Tailwind yellow-500
  },
];

const propertyTypeColorPalette = [
  {
    status: PropertyType.BAT_DONG_SAN,
    color: "#06b6d4", // Tailwind cyan-500
  },
  {
    status: PropertyType.DONG_SAN,
    color: "#f97316", // Tailwind orange-500
  },
  {
    status: PropertyType.KHOAN_NO,
    color: "#8b5cf6", // Tailwind violet-500
  },
  {
    status: PropertyType.TAI_SAN_KHAC,
    color: "#f43f5e", // Tailwind pink-500
  },
];

const colorPalette = [
  ...contractstatusColorPalette,
  ...paymentStatusColorPallette,
  ...propertyTypeColorPalette,
];

const statusLabelMap: Partial<Record<string, string>> = {
  ...CONTRACT_STATUS_LABELS,
  ...PAYMENT_STATUS_LABELS,
  ...PROPERTY_TYPE_LABELS,
};

const colorMap = Object.fromEntries(
  colorPalette.flatMap(({ status, color }) => {
    const label = statusLabelMap[status];

    return label
      ? [
          [status, color],
          [label, color],
        ]
      : [[status, color]];
  }),
);

type PieChartData = ChartData["percentageOfContractsByStatus"] & {
  keys?: string[];
};

const CustomPieChart = ({
  chartData,
  isLoading = false,
}: {
  chartData: PieChartData;
  isLoading?: boolean;
}) => {
  const data = chartData.labels.map((label, index) => {
    const key = chartData.keys?.[index] ?? label;

    return {
      key,
      name: label,
      value: chartData.data[index] ?? 0,
      fill: colorMap[key] ?? colorMap[label] ?? `var(--chart-${(index % 5) + 1})`,
    };
  });

  const chartConfig = data.reduce<ChartConfig>(
    (config, item) => ({
      ...config,
      [item.key]: {
        label: item.name,
        color: item.fill,
      },
    }),
    {
      value: {
        label: "Tỷ lệ",
      },
    },
  );

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
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square min-h-50 max-h-100 w-full"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel nameKey="key" />}
        />
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={60}>
          {data.map((item) => (
            <Cell key={item.key} fill={item.fill} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="key" />} />
      </PieChart>
    </ChartContainer>
  );
};

export default CustomPieChart;
