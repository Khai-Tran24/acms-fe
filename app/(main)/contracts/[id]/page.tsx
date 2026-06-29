"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getContractById } from "@/lib/api/contract/contract.api";
import { ContractData } from "@/lib/types/contract.type";
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  Edit,
  Gavel,
  SquarePercent,
  UserRound,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { formatDate } from "@/lib/helper/date-formatter.helper";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CONTRACT_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
  getPaymentStatusClassName,
  getStatusClassName,
  getUserDisplayName,
} from "@/components/custom/contract/contract-utils";
import { UpdateContractModal } from "@/components/custom/contract/update-contract-modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/helper/currency-exchange.helper";
import { UpdateContractDiscountPriceForm } from "@/components/custom/contract/update-discount";

const ContractDetailPage = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [contract, setContract] = useState<ContractData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingContract, setEditingContract] = useState<ContractData | null>(
    null,
  );
  const [updateDiscountModal, setUpdateDiscountModal] =
    useState<ContractData | null>(null);

  const fetchContract = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getContractById(params.id);
      setContract(response.data);
    } catch (error) {
      console.error("Error fetching contract detail:", error);
      setErrorMessage("Không thể tải chi tiết hợp đồng.");
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    const loadContract = async () => {
      if (params.id) {
        await fetchContract();
      }
    };
    loadContract();
  }, [params.id, fetchContract]);

  console.log("Contract detail page render:", contract?.discountPrice);

  if (isLoading) {
    return (
      <div className="p-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <div className="mt-4 rounded-lg bg-white p-8 text-center ring-1 ring-foreground/10">
          Đang tải chi tiết hợp đồng...
        </div>
      </div>
    );
  }

  if (errorMessage || !contract) {
    return (
      <div className="p-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <div className="mt-4 rounded-lg bg-white p-8 text-center text-red-600 ring-1 ring-foreground/10">
          {errorMessage || "Không tìm thấy hợp đồng."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <Button onClick={() => setEditingContract(contract)}>
          <Edit className="h-4 w-4" />
          Chỉnh sửa
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2 h-[90]">
        <div className="space-y-4">
          <section className="rounded-lg bg-white p-5 ring-1 ring-foreground/10">
            <div className="mb-4 flex items-center gap-2">
              <Gavel className="h-5 w-5 text-violet-600" />
              <h2 className="text-lg font-semibold">Thông tin hợp đồng</h2>
              <Badge className={getStatusClassName(contract.status)}>
                {CONTRACT_STATUS_LABELS[contract.status]}
              </Badge>
              <Badge
                className={getPaymentStatusClassName(contract.paymentStatus)}
              >
                {PAYMENT_STATUS_LABELS[contract.paymentStatus]}
              </Badge>
            </div>
            <div className="space-y-3">
              <DetailRow label="Mã hợp đồng" value={contract.contractNumber} />
              <DetailRow
                label="Năm hợp đồng"
                value={String(contract.contractYear)}
              />
              <DetailRow label="Tên tài sản" value={contract.propertyName} />
              <DetailRow
                label="Loại tài sản"
                value={PROPERTY_TYPE_LABELS[contract.propertyType]}
              />
              <DetailRow
                label="Giá khởi điểm"
                value={formatCurrency(contract.startingPrice)}
              />
              <DetailRow
                label="Giá trúng đấu giá"
                value={
                  contract.winningPrice !== undefined
                    ? formatCurrency(Number(contract.winningPrice))
                    : "Chưa cập nhật"
                }
              />
            </div>
          </section>
          <section className="rounded-lg bg-white p-5 ring-1 ring-foreground/10 ">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="mb-4 flex items-center gap-2">
                <Banknote className="h-5 w-5 text-amber-600" />
                <h2 className="text-lg font-semibold">Thông tin giảm giá</h2>
              </div>
              <div>
                <Button onClick={() => setUpdateDiscountModal(contract)}>
                  <SquarePercent /> Thêm giảm giá
                </Button>
              </div>
            </div>
            <div className="h-[18.5vh] overflow-y-scroll">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lần giảm giá</TableHead>
                    <TableHead>Giá giảm</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contract?.discountPrice &&
                    contract?.discountPrice.map((discount, index) => (
                      <TableRow key={index}>
                        <TableCell className="p-3 text-sm font-medium">
                          {discount.times}
                        </TableCell>
                        <TableCell className="p-3 text-sm font-medium">
                          {formatCurrency(discount.amount || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </section>
        </div>
        <div className="space-y-4">
          <section className="rounded-lg bg-white p-5 ring-1 ring-foreground/10">
            <div className="mb-4 flex items-center gap-2">
              <UserRound className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold">Người liên quan</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <InfoBlock
                label="Cán bộ phụ trách"
                value={getCaseOfficerDisplayName(contract.caseOfficer)}
              />
              <InfoBlock
                label="Người tạo"
                value={getUserDisplayName(contract.createdBy)}
              />
              <InfoBlock
                label="Người trúng"
                value={getWinnerDisplayName(contract)}
              />
              <InfoBlock
                label="Liên hệ người trúng"
                value={getWinnerPhone(contract)}
              />
              <InfoBlock
                label="Chủ sở hữu"
                value={getPropertyOwnerDisplayName(contract)}
              />
              <InfoBlock
                label="Liên hệ chủ sở hữu"
                value={getPropertyOwnerPhone(contract)}
              />
            </div>
          </section>
          <section className="rounded-lg bg-white p-5 ring-1 ring-foreground/10">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Lịch trình</h2>
            </div>
            <div className="space-y-3">
              <InfoBlock
                label="Hạn đăng ký"
                value={formatDate(contract.endRegisterDate as string)}
              />
              <InfoBlock
                label="Thời gian đấu giá"
                value={formatDate(contract.auctionDate as string)}
              />
              <InfoBlock
                label="Tạo lúc"
                value={formatDate(contract.createdAt)}
              />
              <InfoBlock
                label="Cập nhật lúc"
                value={formatDate(contract.updatedAt)}
              />
            </div>
          </section>
        </div>
      </div>

      <Dialog
        open={Boolean(updateDiscountModal)}
        onOpenChange={(open) => {
          if (!open) setUpdateDiscountModal(null);
        }}
      >
        <DialogContent className="overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cập nhật giảm giá</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin giảm giá hợp đồng đang chọn.
            </DialogDescription>
          </DialogHeader>
          {updateDiscountModal && (
            <UpdateContractDiscountPriceForm
              id={updateDiscountModal.id}
              setOpen={(open) => {
                if (!open) setUpdateDiscountModal(null);
              }}
              onSuccess={fetchContract}
            />
          )}
        </DialogContent>
      </Dialog>

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
              onSuccess={fetchContract}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const getCaseOfficerDisplayName = (
  caseOfficer: ContractData["caseOfficer"],
) => {
  if (!caseOfficer) return "Chưa phân công";
  return (
    caseOfficer.username || caseOfficer.email || String(caseOfficer.id ?? "")
  );
};

const getWinnerDisplayName = (contract: ContractData) =>
  contract.winner?.name || "Chưa cập nhật";

const getWinnerPhone = (contract: ContractData) =>
  contract.winner?.phone || "Chưa cập nhật";

const getPropertyOwnerDisplayName = (contract: ContractData) =>
  contract.propertyOwner?.name || "Chưa cập nhật";

const getPropertyOwnerPhone = (contract: ContractData) =>
  contract.propertyOwner?.phone || "Chưa cập nhật";

const InfoBlock = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border bg-slate-50 p-3">
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    <p className="mt-1 text-sm font-semibold">{value}</p>
  </div>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="break-all text-right text-sm font-medium">{value}</span>
    </div>
    <Separator />
  </div>
);

export default ContractDetailPage;
