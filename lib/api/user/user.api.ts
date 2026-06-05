import { Response } from "@/lib/types/reponse.type";
import { UserData, UserDetails } from "@/lib/types/user.type";
import api from "../api";

const getAllUsers = async () => {
  try {
    const response = await api.get("/users");
    return response.data as Response<UserData[]>;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

const getUserDetails = async (userId: string) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data as Response<UserDetails>;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

const createUser = async (userData: Partial<UserData>) => {
  try {
    const response = await api.post("/users", userData);
    return response.data as Response<UserData>;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

const updateUser = async (userId: string, userData: Partial<UserData>) => {
  try {
    const response = await api.patch(`/users/${userId}`, userData);
    return response.data as Response<UserData>;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

const deleteUser = async (userId: string) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data as Response<null>;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export { getAllUsers, getUserDetails, createUser, updateUser, deleteUser };
