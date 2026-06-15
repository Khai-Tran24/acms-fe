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
  SelectLabel,
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
import {
  deleteContract,
  getAllContracts,
} from "@/lib/api/contract/contract.api";
import { useToast } from "@/lib/hooks/use-toast";
import { ContractData, GetContractsQuery } from "@/lib/types/contract.type";
import { PaginationInfo } from "@/lib/types/reponse.type";
import {
  Download,
  Edit,
  Ellipsis,
  Eye,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getAllUsers } from "@/lib/api/user/user.api";
import { UserData } from "@/lib/types/user.type";
import { CalendarInput } from "@/components/custom/input/calendar-input";
import { formatCurrency } from "@/lib/helper/currency-exchange.helper";
import { formatDate } from "@/lib/helper/date-formatter.helper";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateContractModal } from "@/components/custom/contract/create-contract-modal";
import {
  CONTRACT_STATUS_LABELS,
  getStatusClassName,
} from "@/components/custom/contract/contract-utils";
import { UpdateContractModal } from "@/components/custom/contract/update-contract-modal";

const DEFAULT_PAGINATION: PaginationInfo = {
  page: 1,
  limit: 10,
  totalPages: 1,
  totalItems: 0,
};

const ContractPage = () => {
  const router = useRouter();
  const toast = useToast();
  const toastRef = useRef(toast);
  const [page, setPage] = useState(DEFAULT_PAGINATION.page);
  const [limit, setLimit] = useState(DEFAULT_PAGINATION.limit);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<GetContractsQuery["sortBy"]>();
  const [sortOrder, setSortOrder] = useState<GetContractsQuery["sortOrder"]>();
  const [filterByUserId, setFilterByUserId] =
    useState<GetContractsQuery["filterByUserId"]>();
  const [startRegisterDate, setStartRegisterDate] = useState<string>("");
  const [endRegisterDate, setEndRegisterDate] = useState<string>("");
  const [auctionDate, setAuctionDate] = useState<string>("");
  const [contractData, setContractData] = useState<ContractData[]>([]);
  const [auctioneers, setAuctioneers] = useState<UserData[]>([]);
  const [secretaries, setSecretaries] = useState<UserData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [pagination, setPagination] =
    useState<PaginationInfo>(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<ContractData | null>(
    null,
  );

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const fetchContracts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllContracts({
        page,
        limit,
        search: search || undefined,
        filterByUserId: filterByUserId || undefined,
        sortBy,
        sortOrder,
        startRegisterDate: startRegisterDate || undefined,
        endRegisterDate: endRegisterDate || undefined,
        auctionDate: auctionDate || undefined,
      });
      setContractData(response.data);
      setPagination(response.pagination ?? DEFAULT_PAGINATION);
    } catch (error) {
      console.error("Error fetching contract data:", error);
      toastRef.current.error("Có lỗi xảy ra khi tải danh sách hợp đồng.");
    } finally {
      setIsLoading(false);
    }
  }, [filterByUserId, limit, page, search, sortBy, sortOrder, startRegisterDate, endRegisterDate, auctionDate]);

  const seperateUsersByRole = (users: UserData[]) => {
    const auctioneers = users.filter((user) => user.role === "AUCTIONEER");
    const secretaries = users.filter((user) => user.role === "SECRETARY");
    const otherUsers = users.filter(
      (user) => user.role !== "AUCTIONEER" && user.role !== "SECRETARY",
    );
    return { auctioneers, secretaries, otherUsers };
  };

  const fetchUsers = useCallback(async () => {
    try {
      const response = await getAllUsers({ limit: 1000 });
      const { auctioneers, secretaries, otherUsers } = seperateUsersByRole(
        response.data,
      );
      setAuctioneers(auctioneers);
      setSecretaries(secretaries);
      setUsers(otherUsers);
    } catch (error) {
      console.error("Error fetching users for filter:", error);
      toastRef.current.error("Có lỗi xảy ra khi tải danh sách người dùng.");
      return [];
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchContracts(), fetchUsers()]);
    };
    loadData();
  }, [fetchContracts, fetchUsers]);

  const handlePageSizeChange = (pageSize: number) => {
    setLimit(pageSize);
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setStartRegisterDate("");
    setEndRegisterDate("");
    setAuctionDate("");
    setFilterByUserId(undefined);
    setSortBy(undefined);
    setSortOrder(undefined);
    setPage(1);
  };

  const handleDelete = async (contract: ContractData) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa hợp đồng "${contract.title}" không?`,
    );
    if (!confirmed) return;

    try {
      await deleteContract(contract.id);
      toast.success("Hợp đồng đã được xóa thành công.");
      fetchContracts();
    } catch (error) {
      console.error("Error deleting contract:", error);
      toast.error("Có lỗi xảy ra khi xóa hợp đồng.");
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Quản lý hợp đồng</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Thêm hợp đồng
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Thêm hợp đồng</DialogTitle>
              <DialogDescription>
                Nhập thông tin để tạo hợp đồng đấu giá mới.
              </DialogDescription>
            </DialogHeader>
            <CreateContractModal
              setOpen={setCreateOpen}
              onSuccess={fetchContracts}
            />
          </DialogContent>
        </Dialog>
      </div>

      <main className="mb-4 rounded-lg bg-white p-4 ring-1 ring-foreground/10">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <InputGroup className="w-full lg:min-w-80 lg:flex-1">
            <InputGroupInput
              value={search}
              placeholder="Tìm kiếm hợp đồng..."
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
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
              value={filterByUserId ?? "all"}
              onValueChange={(value) => {
                setFilterByUserId(value === "all" ? undefined : value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full lg:w-50">
                <SelectValue placeholder="Bộ lọc" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Tất cả người dùng</SelectItem>
                  <SelectGroup>
                    <SelectLabel>Đấu giá viên</SelectLabel>
                    {auctioneers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.username} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Thư ký</SelectLabel>
                    {secretaries.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.username} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Người dùng khác</SelectLabel>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.username} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={sortBy ?? "none"}
              onValueChange={(value) => {
                setSortBy(
                  value === "none"
                    ? undefined
                    : (value as GetContractsQuery["sortBy"]),
                );
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full lg:w-36">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="none">Mới nhất</SelectItem>
                  <SelectItem value="createdAt">Ngày tạo</SelectItem>
                  <SelectItem value="username">Người tạo</SelectItem>
                  <SelectItem value="email">Email người tạo</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={sortOrder ?? "none"}
              onValueChange={(value) => {
                setSortOrder(
                  value === "none"
                    ? undefined
                    : (value as GetContractsQuery["sortOrder"]),
                );
                setPage(1);
              }}
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
        <div className="mb-4 flex items-center gap-4">
          <CalendarInput
            placeholder="Ngày bắt đầu đăng ký"
            date={startRegisterDate}
            onDateChange={(date) => {
              setStartRegisterDate(date);
              setPage(1);
            }}
          />
          <CalendarInput
            placeholder="Ngày kết thúc đăng ký"
            date={endRegisterDate}
            onDateChange={(date) => {
              setEndRegisterDate(date);
              setPage(1);
            }}
          />
          <CalendarInput
            placeholder="Ngày đấu giá"
            date={auctionDate}
            onDateChange={(date) => {
              setAuctionDate(date);
              setPage(1);
            }}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Số quy chế</TableHead>
              <TableHead>Giá khởi điểm</TableHead>
              <TableHead>Tạo bởi</TableHead>
              <TableHead>Thời gian đăng ký</TableHead>
              <TableHead>Thời gian đấu giá</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center">
                  Đang tải danh sách hợp đồng...
                </TableCell>
              </TableRow>
            ) : contractData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center">
                  Chưa có hợp đồng phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              contractData.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>{contract.id.slice(0, 8)}...</TableCell>
                  <TableCell className="font-medium">
                    {contract.title}
                  </TableCell>
                  <TableCell>{contract.regulationNumber}</TableCell>
                  <TableCell>
                    {formatCurrency(contract.startingPrice)}
                  </TableCell>
                  <TableCell>
                    {contract.createdBy?.username}
                    {contract.createdBy?.email && (
                      <span className="ml-1 text-sm text-gray-500">
                        ({contract.createdBy.email})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatDate(contract.registerStartDate)} -{" "}
                    {formatDate(contract.registerExpiredDate)}
                  </TableCell>
                  <TableCell>
                    {formatDate(contract.auctionDate)} -{" "}
                    {formatDate(
                      String(
                        new Date(
                          new Date(contract.auctionDate).getTime() +
                            contract.auctionTime * 60000,
                        ),
                      ),
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={getStatusClassName(contract.status)}>
                      {CONTRACT_STATUS_LABELS[contract.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Ellipsis />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/contracts/${contract.id}`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setEditingContract(contract)}
                        >
                          <Edit className="h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDelete(contract)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
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

      <Dialog
        open={Boolean(editingContract)}
        onOpenChange={(open) => {
          if (!open) setEditingContract(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Cập nhật hợp đồng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin hợp đồng đang chọn.
            </DialogDescription>
          </DialogHeader>
          {editingContract && (
            <UpdateContractModal
              contract={editingContract}
              setOpen={(open) => {
                if (!open) setEditingContract(null);
              }}
              onSuccess={fetchContracts}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractPage;
