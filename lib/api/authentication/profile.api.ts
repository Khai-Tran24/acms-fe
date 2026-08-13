import api from "../api";
import { Response } from "@/lib/types/reponse.type";
import { UserData } from "@/lib/types/user.type";

export type ProfileUpdate = Pick<
  UserData,
  "username" | "fullName" | "phone" | "avatar"
>;

export async function getMyProfile() {
  const response = await api.get<Response<UserData>>("/auth/me");
  return response.data.data;
}

export async function updateMyProfile(payload: ProfileUpdate) {
  const response = await api.patch<Response<UserData>>("/auth/me", payload);
  return response.data.data;
}

export async function changeMyPassword(payload: {
  currentPassword: string;
  newPassword: string;
}) {
  const response = await api.post<Response<null>>(
    "/auth/change-password",
    payload,
  );
  return response.data;
}
