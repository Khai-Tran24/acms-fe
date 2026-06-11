import { Button } from "@/components/ui/button";
import { deleteUser } from "@/lib/api/user/user.api";
import { AlertTriangle } from "lucide-react";
import React, { useState } from "react";

export const DeleteUserModal = ({
  userId,
  setOpen,
}: {
  userId: string;
  setOpen: (open: boolean) => void;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteUser(userId);

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-start gap-4 bg-red-50 p-4 rounded-lg border border-red-200">
        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900 mb-1">
            Xóa người dùng vĩnh viễn
          </h3>
          <p className="text-sm text-red-800">
            Hành động này không thể được hoàn tác. Tất cả dữ liệu của người dùng
            sẽ bị xóa vĩnh viễn khỏi hệ thống.
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {isDeleting ? "Đang xóa..." : "Xóa người dùng"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
          onClick={() => {
            setOpen(false);
          }}
        >
          Hủy
        </Button>
      </div>
    </div>
  );
};
