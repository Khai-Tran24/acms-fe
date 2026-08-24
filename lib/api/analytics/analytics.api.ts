import api from "../api";
import { Response } from "@/lib/types/reponse.type";
import {
  AssetBreakdownItem,
  ContractOwnerBreakdownItem,
  DashboardData,
  DashboardSummary,
  DashboardTimeframe,
  LiquidatedFile,
  RecentFile,
  TopOfficer,
  TrendPoint,
} from "@/lib/types/analytic.type";

const get = async <T>(url: string, params?: Record<string, string>) => {
  const response = await api.get<Response<T>>(url, { params });
  if (!response.data.success || response.data.data == null) {
    throw new Error(response.data.message || "Không thể tải dữ liệu dashboard");
  }
  return response.data.data;
};

export const getDashboardData = async (
  timeframe: DashboardTimeframe = "12m",
): Promise<DashboardData> => {
  const [
    summary,
    trends,
    assetBreakdown,
    contractOwnerBreakdown,
    recentFiles,
    liquidatedFiles,
    topOfficers,
  ] = await Promise.all([
      get<DashboardSummary>("/api/dashboard/summary"),
      get<TrendPoint[]>("/api/dashboard/charts/trends", { timeframe }),
      get<AssetBreakdownItem[]>("/api/dashboard/charts/asset-breakdown"),
      get<ContractOwnerBreakdownItem[]>(
        "/api/dashboard/charts/contract-owner-breakdown",
      ),
      get<RecentFile[]>("/api/dashboard/tables/recent-files"),
      get<LiquidatedFile[]>("/api/dashboard/tables/liquidated-files"),
      get<TopOfficer[]>("/api/dashboard/tables/top-officers"),
    ]);

  return {
    summary,
    trends,
    assetBreakdown,
    contractOwnerBreakdown,
    recentFiles,
    liquidatedFiles,
    topOfficers,
  };
};
