import DashboardClient from "../../../components/custom/dashboard/dashboard-client";

type DashboardSearchParams = Promise<{
  startDate?: string | string[];
  endDate?: string | string[];
}>;

const getParam = (value?: string | string[]) => {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
};

const DashboardPage = async ({
  searchParams,
}: {
  searchParams: DashboardSearchParams;
}) => {
  const params = await searchParams;

  return (
    <DashboardClient
      initialParams={{
        startDate: getParam(params.startDate),
        endDate: getParam(params.endDate),
      }}
    />
  );
};

export default DashboardPage;
