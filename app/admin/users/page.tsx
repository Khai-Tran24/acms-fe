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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllUsers } from "@/lib/api/user/user.api";
import { RoleEnum } from "@/lib/enums/role.enum";
import { PaginationInfo } from "@/lib/types/reponse.type";
import { GetUsersQuery, UserData } from "@/lib/types/user.type";
import { Edit, Eye, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ViewDetailModal } from "./_components/view-detail-modal";
import { UpdateUserModal } from "./_components/update-user-modal";
import { DeleteUserModal } from "./_components/delete-user-modal";
import { useDebounce } from "@/lib/hooks/use-debounce";

const DEFAULT_PAGINATION: PaginationInfo = {
  page: 1,
  limit: 10,
  totalPages: 1,
  totalItems: 0,
};

const UserPage = () => {
  const [userData, setUserData] = useState<UserData[]>([]);
  const [pagination, setPagination] =
    useState<PaginationInfo>(DEFAULT_PAGINATION);
  const [page, setPage] = useState(DEFAULT_PAGINATION.page);
  const [limit, setLimit] = useState(DEFAULT_PAGINATION.limit);
  const [search, setSearch] = useState("");
  const [filterByRole, setFilterByRole] =
    useState<GetUsersQuery["filterByRole"]>();
  const [filterByStatus, setFilterByStatus] =
    useState<GetUsersQuery["filterByStatus"]>();
  const [sortBy, setSortBy] = useState<GetUsersQuery["sortBy"]>();
  const [sortOrder, setSortOrder] = useState<GetUsersQuery["sortOrder"]>();
  const [, setCloseUpdateModal] = useState(false);
  const [, setCloseDeleteModal] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getAllUsers({
          page,
          limit,
          search: debouncedSearch || undefined,
          filterByRole,
          filterByStatus,
          sortBy,
          sortOrder,
        });
        setUserData(response.data);
        setPagination(response.pagination);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [
    page,
    limit,
    debouncedSearch,
    filterByRole,
    filterByStatus,
    sortBy,
    sortOrder,
  ]);

  const handlePageSizeChange = (pageSize: number) => {
    setLimit(pageSize);
    setPage(1);
  };

  const handleRoleChange = (value: string) => {
    setFilterByRole(value === "all" ? undefined : (value as RoleEnum));
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setFilterByStatus(value === "all" ? undefined : value === "active");
    setPage(1);
  };

  const handleSortByChange = (value: string) => {
    setSortBy(
      value === "none" ? undefined : (value as GetUsersQuery["sortBy"]),
    );
    setPage(1);
  };

  const handleSortOrderChange = (value: string) => {
    setSortOrder(
      value === "none" ? undefined : (value as GetUsersQuery["sortOrder"]),
    );
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setFilterByRole(undefined);
    setFilterByStatus(undefined);
    setSortBy(undefined);
    setSortOrder(undefined);
    setPage(1);
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Thêm người dùng
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Thêm người dùng</DialogTitle>
              <DialogDescription>
                Nhập thông tin để tạo người dùng mới.
              </DialogDescription>
            </DialogHeader>
            <div>Hello</div>
          </DialogContent>
        </Dialog>
      </div>

      <main className="rounded-lg bg-white p-4 ring-1 ring-foreground/10 mb-4">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <InputGroup className="w-full lg:min-w-72 lg:flex-1">
            <InputGroupInput
              value={search}
              placeholder="Tìm kiếm người dùng..."
              onChange={(event) => setSearch(event.target.value)}
            />
            <InputGroupAddon>
              <Search className="text-gray-500" />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              {pagination.totalItems} kết quả
            </InputGroupAddon>
          </InputGroup>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:items-center">
            <Select
              value={filterByRole ?? "all"}
              onValueChange={handleRoleChange}
            >
              <SelectTrigger className="w-full lg:w-36">
                <SelectValue placeholder="Vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  {Object.values(RoleEnum).map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={
                filterByStatus === undefined
                  ? "all"
                  : filterByStatus
                    ? "active"
                    : "inactive"
              }
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select value={sortBy ?? "none"} onValueChange={handleSortByChange}>
              <SelectTrigger className="w-full lg:w-36">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="none">Không sắp xếp</SelectItem>
                  <SelectItem value="username">Tên người dùng</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="createdAt">Ngày tạo</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={sortOrder ?? "none"}
              onValueChange={handleSortOrderChange}
            >
              <SelectTrigger className="w-full lg:w-32">
                <SelectValue placeholder="Thứ tự" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="none">Mặc định</SelectItem>
                  <SelectItem value="asc">Tăng dần</SelectItem>
                  <SelectItem value="desc">Giảm dần</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              onClick={resetFilters}
              className="col-span-2 sm:col-span-4 lg:col-span-1"
            >
              <RotateCcw />
              Reset
            </Button>
          </div>
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
                  <Badge className="bg-gray-300 text-black">
                    {user.role === RoleEnum.AUCTIONEER
                      ? "Đấu giá viên"
                      : user.role === RoleEnum.SECRETARY
                        ? "Thư ký"
                        : user.role === RoleEnum.ADMIN
                          ? "Quản trị viên"
                          : user.role}
                  </Badge>
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
                    <DialogContent className="sm:max-w-lg">
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
                      <UpdateUserModal
                        user={user}
                        setOpen={setCloseUpdateModal}
                      />
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild disabled={user.isActive === true}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mr-2 text-red-500 hover:text-red-700 hover:bg-red-100"
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
                      <DeleteUserModal
                        userId={user.id}
                        setOpen={setCloseDeleteModal}
                      />
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </main>
      <CustomPagination
        currentPage={pagination.page}
        pageSize={pagination.limit}
        totalItems={pagination.totalItems}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};

export default UserPage;
