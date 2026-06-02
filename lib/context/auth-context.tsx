"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { RoleEnum } from "../enums/role.enum";
import { decodeJwt } from "../common/jwt";
import {
  getAccessToken,
  signOut,
  signUp,
} from "../api/authentication/authentication.api";
import { UserData } from "../types/user.type";
import { signIn } from "../api/authentication/authentication.api";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "../hooks/use-toast";
import { LoginRequest, RegisterRequest } from "../types/authentication.type";

export interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  userRole: RoleEnum | null;
  isLoading: boolean;
  login: (loginData: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    registerData: RegisterRequest,
    setOpen?: (open: boolean) => void,
  ) => Promise<void>;
  refreshAuth: () => void;
}

const initialState: AuthContextType = {
  isAuthenticated: false,
  user: null,
  userRole: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  refreshAuth: () => {},
};

const AuthContext = createContext<AuthContextType>(initialState);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [userRole, setUserRole] = useState<RoleEnum | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useToast();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    const token = getAccessToken();
    setIsLoading(true);
    if (token) {
      try {
        const decoded = decodeJwt(token);
        setIsAuthenticated(true);
        setUser(decoded);
        setUserRole((decoded?.role as RoleEnum) || null);
      } catch (error) {
        console.error("Error decoding token:", error);
        setIsAuthenticated(false);
        setUser(null);
        setUserRole(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setUserRole(null);
    }
    setIsLoading(false);
  }, [path]);

  const login = async (loginData: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await signIn(loginData);

      if (response.status === "success" && response.data.accessToken) {
        const token = response.data.accessToken;
        localStorage.setItem("accessToken", token);
        const decoded = decodeJwt(token);

        success("Đăng nhập thành công!");

        setTimeout(() => {
          if (decoded?.role === RoleEnum.ADMIN) {
            router.push("/admin/dashboard");
          } else {
            router.push("/contracts");
          }
          setIsLoading(false);
          localStorage.setItem("user", JSON.stringify(decoded));
        }, 1000);
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (err: unknown) {
      error(
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        ).response?.data?.message ||
          (err as { message?: string }).message ||
          "Đăng nhập thất bại",
      );
      setIsLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setUserRole(null);
    }
  };

  const register = async (
    registerData: RegisterRequest,
    setOpen?: (open: boolean) => void,
  ) => {
    try {
      setIsLoading(true);
      const response = await signUp(registerData);

      if (response.status === "success") {
        success(
          "Đăng ký thành công, vui lòng kiểm tra email để xác nhận tài khoản!",
        );
        setOpen?.(true);
      } else {
        throw new Error(response.message || "Đăng ký thất bại");
      }
    } catch (err: unknown) {
      error(
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        ).response?.data?.message ||
          (err as { message?: string }).message ||
          "Đăng ký thất bại",
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = () => {
    const token = getAccessToken();
    if (token) {
      try {
        const decoded = decodeJwt(token);
        setIsAuthenticated(true);
        setUser(decoded);
        setUserRole((decoded?.role as RoleEnum) || null);
      } catch (error) {
        console.error("Error refreshing auth:", error);
        setIsAuthenticated(false);
        setUser(null);
        setUserRole(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setUserRole(null);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    userRole,
    isLoading,
    login,
    logout,
    register,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
