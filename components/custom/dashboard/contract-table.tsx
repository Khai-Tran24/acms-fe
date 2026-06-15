import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "date-fns";
import {
  CONTRACT_STATUS_LABELS,
  getStatusClassName,
} from "../contract/contract-utils";
import { ContractStatusEnum } from "@/lib/enums/contract.enum";

const mockData = [
  {
    id: "1",
    regulationNumber: "1234",
    title: "Demo 2",
    description: "",
    startingPrice: 2000000000,
    applicationFee: 100000,
    deposit: 500000000,
    registerStartDate: "2026-06-09T17:00:00.000Z",
    registerExpiredDate: "2026-06-15T17:00:00.000Z",
    auctionDate: "2026-06-25T17:00:00.000Z",
    auctionTime: 90,
    status: ContractStatusEnum.DANG_THUC_HIEN,
  },
  {
    id: "2",
    regulationNumber: "123",
    title: "Demo Contract 1 updated",
    description:
      "This is my very first demo for contract flow, i just write something to test UI",
    startingPrice: 1000000000,
    applicationFee: 100000,
    deposit: 200000000,
    registerStartDate: "2026-06-06T17:00:00.000Z",
    registerExpiredDate: "2026-06-09T17:00:00.000Z",
    auctionDate: "2026-10-24T17:00:00.000Z",
    auctionTime: 30,
    status: ContractStatusEnum.MOI,
  },
];
export const ContractTable = () => {
  return (
    <div className="rounded-lg bg-white p-4 ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Số quy chế</TableHead>
            <TableHead>Tiêu đề</TableHead>
            <TableHead>Giá khởi điểm</TableHead>
            <TableHead>Thời gian đăng ký</TableHead>
            <TableHead>Thời gian đấu giá</TableHead>
            <TableHead>Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockData.map((contract) => (
            <TableRow key={contract.id}>
              <TableCell>{contract.id}</TableCell>
              <TableCell>{contract.regulationNumber}</TableCell>
              <TableCell>{contract.title}</TableCell>
              <TableCell>{contract.startingPrice.toLocaleString()}</TableCell>
              <TableCell>
                {formatDate(contract.registerStartDate, "HH:mm dd-MM-yyyy")} -{" "}
                {formatDate(contract.registerExpiredDate, "HH:mm dd-MM-yyyy")}
              </TableCell>

              <TableCell>
                {formatDate(contract.auctionDate, "HH:mm dd-MM-yyyy")} -{" "}
                {formatDate(
                  String(
                    new Date(
                      new Date(contract.auctionDate).getTime() +
                        contract.auctionTime * 60000,
                    ),
                  ),
                  "HH:mm dd-MM-yyyy",
                )}
              </TableCell>
              <TableCell>
                <Badge className={getStatusClassName(contract.status)}>
                  {CONTRACT_STATUS_LABELS[contract.status]}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
