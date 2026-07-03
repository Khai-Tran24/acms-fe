import {
  ContractData,
  ContractsResponse,
  GetContractsQuery,
  ContractPayload,
} from "@/lib/types/contract.type";
import api from "../api";
import { Response } from "@/lib/types/reponse.type";
import { RoleEnum } from "@/lib/enums/role.enum";

const getAllContracts = async (query?: GetContractsQuery) => {
  try {
    const response = await api.get("/contracts", { params: query });
    return response.data as Response<ContractsResponse>;
  } catch (error) {
    console.error("Error fetching contracts:", error);
    throw error;
  }
};

const getContractById = async (id: string) => {
  try {
    const response = await api.get(`/contracts/${id}`);
    return response.data as Response<ContractData>;
  } catch (error) {
    console.error("Error fetching contract:", error);
    throw error;
  }
};

const createContract = async (contractData: ContractPayload) => {
  try {
    const response = await api.post("/contracts", contractData);
    return response.data as Response<ContractData>;
  } catch (error) {
    console.error("Error creating contract:", error);
    throw error;
  }
};

const updateContract = async (
  id: string,
  contractData: Partial<ContractPayload>,
) => {
  try {
    const response = await api.patch(`/contracts/${id}`, contractData);
    return response.data as Response<ContractData>;
  } catch (error) {
    console.error("Error updating contract:", error);
    throw error;
  }
};

const deleteContract = async (id: string) => {
  try {
    const response = await api.delete(`/contracts/${id}`);
    return response.data as Response<ContractData>;
  } catch (error) {
    console.error("Error deleting contract:", error);
    throw error;
  }
};

const getContractFilterOptions = async () => {
  try {
    const response = await api.get("/contracts/filter-options");
    return response.data as Response<{
      years: number[];
      caseOfficers: { id: string; username: string; role: RoleEnum }[];
    }>;
  } catch (error) {
    console.error("Error fetching contract filter options:", error);
    throw error;
  }
};

const updateContractDiscountPrice = async (
  id: string,
  discountPrice: { amount?: number; times?: number },
) => {
  try {
    const response = await api.patch(
      `/contracts/${id}/discount-price`,
      discountPrice,
    );
    return response.data as Response<ContractData>;
  } catch (error) {
    console.error("Error updating contract discount price:", error);
    throw error;
  }
};

const exportContractsToExcel = async (query?: GetContractsQuery) => {
  try {
    const response = await api.get("/contracts/export/excel", {
      params: query,
      responseType: "blob",
    });
    return response.data as Blob;
  } catch (error) {
    console.error("Error exporting contracts to Excel:", error);
    throw error;
  }
};

export {
  getAllContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
  getContractFilterOptions,
  updateContractDiscountPrice,
  exportContractsToExcel,
};
