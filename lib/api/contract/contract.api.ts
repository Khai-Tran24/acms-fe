import {
  ContractData,
  ContractPayload,
  GetContractsQuery,
} from "@/lib/types/contract.type";
import api from "../api";
import { PaginatedResponse, Response } from "@/lib/types/reponse.type";

const getAllContracts = async (query?: GetContractsQuery) => {
  try {
    const response = await api.get("/contracts", { params: query });
    return response.data as PaginatedResponse<ContractData[]>;
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

export {
  getAllContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
};
