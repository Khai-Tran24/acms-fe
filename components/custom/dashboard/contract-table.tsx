import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CONTRACT_STATUS_LABELS,
  getPaymentStatusClassName,
  getPropertyTypeClassName,
  getStatusClassName,
  PAYMENT_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
} from "../contract/contract-utils";
import { recentContractsData } from "@/lib/types/analytic.type";

export const ContractTable = ({
  contracts,
  isLoading = false,
}: {
  contracts: recentContractsData[];
  isLoading?: boolean;
}) => {
  return (
    <div className="rounded-lg bg-white p-4 ring-1 ring-foreground/10">
      <p className="mb-2 text-lg font-bold">Hồ sơ gần đây</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Số hợp đồng</TableHead>
            <TableHead>Tên tài sản</TableHead>
            <TableHead>Loại tài sản</TableHead>
            <TableHead>Trạng thái hồ sơ</TableHead>
            <TableHead>Trạng thái thanh toán</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center">
                Đang tải danh sách hồ sơ...
              </TableCell>
            </TableRow>
          ) : contracts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center">
                Chưa có hồ sơ gần đây.
              </TableCell>
            </TableRow>
          ) : (
            contracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell>{contract.id}</TableCell>
                <TableCell className="font-medium">
                  {contract.contractNumber}
                </TableCell>
                <TableCell>{contract.propertyName}</TableCell>
                <TableCell>
                  <Badge
                    className={getPropertyTypeClassName(contract.propertyType)}
                  >
                    {PROPERTY_TYPE_LABELS[contract.propertyType]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusClassName(contract.status)}>
                    {CONTRACT_STATUS_LABELS[contract.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={getPaymentStatusClassName(
                      contract.paymentStatus,
                    )}
                  >
                    {PAYMENT_STATUS_LABELS[contract.paymentStatus]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
