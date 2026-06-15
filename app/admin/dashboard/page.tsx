import CustomBarChart from "@/components/custom/dashboard/chart/custom-bar-chart";
import CustomPieChart from "@/components/custom/dashboard/chart/custom-pie-chart";
import { ContractTable } from "@/components/custom/dashboard/contract-table";
import CardSection from "@/components/custom/section/card-section";
import { ScrollText } from "lucide-react";

const DashboardPage = () => {
  const cardData = [
    {
      title: "Tổng số hồ sơ",
      value: 100,
      icon: <ScrollText className="text-blue-700" />,
    },
    {
      title: "Hồ sơ đang xử lý",
      value: 50,
      icon: <ScrollText className="text-blue-700" />,
    },
    {
      title: "Hồ sơ đã hoàn thành",
      value: 30,
      icon: <ScrollText className="text-blue-700" />,
    },
    {
      title: "Hồ sơ bị hủy",
      value: 20,
      icon: <ScrollText className="text-blue-700" />,
    },
  ];

  const chartData = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Bảng thống kê</h1>
      <div className="grid md:grid-cols-4 gap-2 mb-4">
        {cardData.map((data, index) => (
          <CardSection key={index} data={data} />
        ))}
      </div>

      <div className="grid md:grid-cols-2 mb-4 gap-2">
        <div className="rounded-lg bg-white p-4 ring-1 ring-foreground/10">
          <div>
            <p className="text-lg font-bold mb-2">Thống kê hồ sơ theo tháng</p>
          </div>

          <CustomBarChart chartData={chartData} />
        </div>
        <div className="rounded-lg bg-white p-4 ring-1 ring-foreground/10">
          <div>
            <p className="text-lg font-bold mb-2">Tình trạng hồ sơ</p>
          </div>
          <CustomPieChart />
        </div>
      </div>

      <ContractTable />
    </div>
  );
};

export default DashboardPage;
