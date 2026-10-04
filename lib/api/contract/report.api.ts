import api from "../api";
import { Response } from "@/lib/types/reponse.type";
import { ContractReport, ContractReportQuery } from "@/lib/types/report.type";

export async function getContractReport(query: ContractReportQuery) {
  const response = await api.get<Response<ContractReport>>("/contract/report", {
    params: query,
  });
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Không thể tải báo cáo.");
  }
  return response.data.data;
}
