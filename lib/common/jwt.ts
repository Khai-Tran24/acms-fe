import { jwtDecode } from "jwt-decode";
import { UserData } from "../types/user.type";

export const decodeJwt = (token: string) => {
  try {
    const decodedPayload = jwtDecode(token);
    return decodedPayload as UserData;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
};