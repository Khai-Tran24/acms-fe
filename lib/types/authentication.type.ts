export interface AuthResponse {
  accessToken: string;
}

export interface LoginRequest {
  loginIdentify: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  role: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: number;
}
