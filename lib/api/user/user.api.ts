import { Response } from "@/lib/types/reponse.type";
import { UserData } from "@/lib/types/user.type";
import api from "../api";

const getAllUsers = async () => {
  try {
    const response = await api.get("/users");
    return response.data as Response<UserData>;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

const getUserDetails = async (userId: string) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data as Response<UserData>;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

const createUser = async (userData: Partial<UserData>) => {
  try {
    const response = await api.post("/user", userData);
    return response.data as Response<UserData>;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

const updateUser = async (userData: Partial<UserData>) => {
  try {
    const response = await api.put("/user", userData);
    return response.data as Response<UserData>;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

const deleteUser = async () => {
  try {
    const response = await api.delete("/user");
    return response.data as Response<null>;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export { getAllUsers, getUserDetails, createUser, updateUser, deleteUser };
