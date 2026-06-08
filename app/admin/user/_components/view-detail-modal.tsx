"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserDetails } from "@/lib/api/user/user.api";
import { RoleEnum } from "@/lib/enums/role.enum";
import { UserData, UserDetails } from "@/lib/types/user.type";
import { useEffect, useState } from "react";

export const ViewDetailModal = ({ user }: { user: UserData }) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setIsLoading(true);
        const response = await getUserDetails(user.id);
        setUserDetails(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [user.id]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6 py-4">
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-6 w-2/3" />
        </div>
      ) : userDetails ? (
        <>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
              <p className="text-base font-semibold text-gray-900">
                {userDetails.email}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Tên người dùng
              </p>
              <p className="text-base font-semibold text-gray-900">
                {userDetails.username}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Vai trò</p>
              <Badge className="bg-gray-300 text-black">
                {userDetails.role === RoleEnum.AUCTIONEER
                  ? "Đấu giá viên"
                  : userDetails.role === RoleEnum.SECRETARY
                    ? "Thư ký"
                    : userDetails.role === RoleEnum.ADMIN
                      ? "Quản trị viên"
                      : userDetails.role}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">
                Trạng thái
              </p>
              <Badge
                className={`${
                  userDetails.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {userDetails.isActive ? "Đang hoạt động" : "Không hoạt động"}
              </Badge>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                Ngày tạo
              </p>
              <p className="text-sm text-gray-600">
                {formatDate(userDetails.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                Cập nhật gần nhất
              </p>
              <p className="text-sm text-gray-600">
                {formatDate(userDetails.updatedAt)}
              </p>
            </div>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500">
          Không thể tải thông tin người dùng
        </p>
      )}
    </div>
  );
};
