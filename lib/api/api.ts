import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { Response } from "@/lib/types/reponse.type";

const baseURL =
  process.env.NODE_ENV === "production"
    ? process.env.API_KEY
    : process.env.NEXT_PUBLIC_API_BASE_URL;

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };
type RefreshTokens = { accessToken: string; refreshToken?: string };

let refreshRequest: Promise<string> | null = null;

const clearSessionAndRedirect = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  if (window.location.pathname !== "/sign-in") {
    window.location.assign("/sign-in");
  }
};

const requestNewAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token is available");

  // Use the base Axios client so a rejected refresh cannot recurse through
  // this response interceptor.
  const response = await axios.post<Response<RefreshTokens>>(
    `${baseURL}/auth/refresh`,
    { refreshToken },
    { headers: { "Content-Type": "application/json" } },
  );
  const tokens = response.data.data;
  if (!response.data.success || !tokens?.accessToken) {
    throw new Error(response.data.message || "Token refresh failed");
  }

  localStorage.setItem("accessToken", tokens.accessToken);
  // The backend rotates refresh tokens, so persist the replacement as well.
  if (tokens.refreshToken) {
    localStorage.setItem("refreshToken", tokens.refreshToken);
  }
  return tokens.accessToken;
};

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetryableRequest | undefined;
    const isUnauthorized = error.response?.status === 401;
    const isRefreshCall = request?.url?.includes("/auth/refresh");
    const isPublicAuthCall =
      request?.url?.includes("/auth/") && !request.url.includes("/auth/me");

    if (
      typeof window === "undefined" ||
      !isUnauthorized ||
      !request ||
      isRefreshCall ||
      isPublicAuthCall
    ) {
      return Promise.reject(error);
    }

    if (request._retry) {
      clearSessionAndRedirect();
      return Promise.reject(error);
    }

    request._retry = true;
    try {
      // All requests that fail together share one refresh operation.
      refreshRequest ??= requestNewAccessToken().finally(() => {
        refreshRequest = null;
      });
      const accessToken = await refreshRequest;
      request.headers.Authorization = `Bearer ${accessToken}`;
      return api(request);
    } catch (refreshError) {
      clearSessionAndRedirect();
      return Promise.reject(refreshError);
    }
  },
);

export default api;
