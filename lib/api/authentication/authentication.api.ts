import api from "../api";
import { Response } from "@/lib/types/reponse.type";
import { UserData } from "@/lib/types/user.type";
import {
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
} from "@/lib/types/authentication.type";

const signIn = async (loginData: LoginRequest) => {
  try {
    const response = await api.post("/auth/login", {
      email: loginData.loginIdentify,
      password: loginData.password,
    });
    return response.data as Response<{ accessToken: string; refreshToken: string }>;
  } catch (error) {
    console.error("Error during sign in:", error);
    throw error;
  }
};

const signUp = async (registerData: RegisterRequest) => {
  try {
    const payload = {
      username: registerData.username,
      email: registerData.email,
      password: registerData.password,
      fullName: registerData.username,
      role:
        registerData.role === "AUCTIONEER"
          ? "DAU_GIA_VIEN"
          : registerData.role === "SECRETARY"
            ? "THU_KY"
            : registerData.role,
    };

    const response = await api.post("/auth/register", payload);
    return response.data as Response<null>;
  } catch (error) {
    console.error("Error during sign up:", error);
    throw error;
  }
};

const verifyOtp = async (verifyOtpData: VerifyOtpRequest) => {
  try {
    const response = await api.post("/auth/verify-email", {
      ...verifyOtpData,
      otp: String(verifyOtpData.otp).padStart(6, "0"),
    });
    return response.data as Response<null>;
  } catch (error) {
    console.error("Error during OTP verification:", error);
    throw error;
  }
};

const signOut = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    const response = await api.post("/auth/logout", { refreshToken });

    if (response.data.success) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }

    return response.data as Response<null>;
  } catch (error) {
    console.error("Error during sign out:", error);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    throw error;
  }
};

const getProfile = async () => {
  try {
    const response = await api.get("/auth/me");
    return response.data as Response<UserData>;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("accessToken");
};

const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
};

const clearAuth = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }
};

const forgotPassword = async (email: string) => {
  try {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data as Response<null>;
  } catch (error) {
    console.error("Error during forgot password:", error);
    throw error;
  }
};

const resetPassword = async (
  email: string,
  token: number,
  newPassword: string,
) => {
  try {
    const response = await api.post("/auth/reset-password", {
      email,
      otp: String(token).padStart(6, "0"),
      newPassword,
    });
    return response.data as Response<null>;
  } catch (error) {
    console.error("Error during reset password:", error);
    throw error;
  }
};

const refreshToken = async (refreshToken: string) => {
  try {
    const response = await api.post("/auth/refresh", { refreshToken });
    return response.data as Response<{
      accessToken: string;
      refreshToken?: string;
    }>;
  } catch (error) {
    console.error("Error during token refresh:", error);
    throw error;
  }
};

export {
  signIn,
  signUp,
  verifyOtp,
  signOut,
  getProfile,
  isAuthenticated,
  getAccessToken,
  clearAuth,
  forgotPassword,
  resetPassword,
  refreshToken,
};
