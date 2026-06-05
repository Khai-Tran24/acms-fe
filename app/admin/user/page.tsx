"use client";

import CustomPagination from "@/components/custom/custom-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllUsers } from "@/lib/api/user/user.api";
import { UserData } from "@/lib/types/user.type";
import { Edit, Eye, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ViewDetailModal } from "./_components/view-detail-modal";
import { UpdateUserModal } from "./_components/update-user-modal";
import { DeleteUserModal } from "./_components/delete-user-modal";

const UserPage = () => {
  const [userData, setUserData] = useState<UserData[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getAllUsers();
        console.log("API response:", response);
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý người dùng</h1>

      <main className="rounded-lg bg-white p-4 ring-1 ring-foreground/10 mb-4">
        <div>
          <InputGroup className="mb-2 w-full">
            <InputGroupInput placeholder="Tìm kiếm người dùng..." />
            <InputGroupAddon>
              <Search className="text-gray-500" />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
          </InputGroup>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tên người dùng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userData.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id.slice(0, 8)}...</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge className="bg-gray-300 text-black">{user.role}</Badge>
                </TableCell>
                <TableCell>
                  {user.isActive ? (
                    <Badge className="bg-green-200 text-green-800">
                      Đang hoạt động
                    </Badge>
                  ) : (
                    <Badge className="bg-red-200 text-red-800">
                      Không hoạt động
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mr-2 text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Chi tiết người dùng</DialogTitle>
                        <DialogDescription>
                          Thông tin chi tiết về người dùng.
                        </DialogDescription>
                      </DialogHeader>
                      <ViewDetailModal user={user} />
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mr-2 text-green-500 hover:text-green-700 hover:bg-green-100"
                        disabled={!user.isActive}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cập nhật người dùng</DialogTitle>
                        <DialogDescription>
                          Cập nhật thông tin người dùng.
                        </DialogDescription>
                      </DialogHeader>
                      <UpdateUserModal user={user} />
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mr-2 text-red-500 hover:text-red-700 hover:bg-red-100"
                        disabled={!user.isActive}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Xóa người dùng</DialogTitle>
                        <DialogDescription>
                          Bạn có chắc chắn muốn xóa người dùng này không?
                        </DialogDescription>
                      </DialogHeader>
                      <DeleteUserModal />
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </main>
      <CustomPagination />
    </div>
  );
};

export default UserPage;
