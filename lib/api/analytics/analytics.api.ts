import { Response } from "@/lib/types/reponse.type";
import api from "../api";
import { AnalyticsData } from "@/lib/types/analytic.type";

export interface AnalyticsParams {
  startDate?: string;
  endDate?: string;
}

const getAnalyticsApi = async (params: AnalyticsParams = {}) => {
  try {
    const response = await api.get("/analytics", { params });
    return response.data as Response<AnalyticsData>;
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    throw error;
  }
};

export default getAnalyticsApi;
