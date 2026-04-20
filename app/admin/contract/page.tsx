import CustomPagination from "@/components/custom/custom-pagination";
import { Button } from "@/components/ui/button";
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
import { Download, Edit, Eye, Search, Trash2 } from "lucide-react";

const ContractPage = () => {
  const userData = [
    {
      id: 1,
      name: "Hợp đồng A",
      regulation_no: "123",
      notification_no: "ABC",
      isActive: true,
    },
    {
      id: 2,
      name: "Hợp đồng B",
      regulation_no: "456",
      notification_no: "DEF",
      isActive: false,
    },
    {
      id: 3,
      name: "Hợp đồng C",
      regulation_no: "789",
      notification_no: "GHI",
      isActive: true,
    },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý hợp đồng</h1>

      <main className="rounded-lg bg-white p-4 ring-1 ring-foreground/10 mb-4">
        <div>
          <InputGroup className="mb-2 w-full">
            <InputGroupInput placeholder="Tìm kiếm hợp đồng..." />
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
              <TableHead>Tên</TableHead>
              <TableHead>Số quy chế</TableHead>
              <TableHead>Số thông báo</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userData.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.regulation_no}</TableCell>
                <TableCell>{user.notification_no}</TableCell>
                <TableCell>
                  {user.isActive ? (
                    <span className="text-green-600">Đang hoạt động</span>
                  ) : (
                    <span className="text-red-600">Không hoạt động</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mr-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-100"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mr-2 text-green-500 hover:text-green-700 hover:bg-green-100"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mr-2 text-red-500 hover:text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mr-2 text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
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

export default ContractPage;
