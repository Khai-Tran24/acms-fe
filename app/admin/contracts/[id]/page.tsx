"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getContractById } from "@/lib/api/contract/contract.api";
import { ContractData } from "@/lib/types/contract.type";
import {
  ArrowLeft,
  CalendarDays,
  Download,
  Edit,
  FileText,
  Gavel,
  Upload,
  UserRound,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { formatCurrency } from "@/lib/helper/currency-exchange.helper";
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
  getStatusClassName,
  getUserDisplayName,
} from "@/components/custom/contract/contract-utils";
import { UpdateContractModal } from "@/components/custom/contract/update-contract-modal";

const mockfile = [
  {
    name: "Quy-che-dau-gia.pdf",
    url: "https://example.com/files/quy-che-dau-gia.pdf",
  },
  {
    name: "Bao-cao-tham-dinh.pdf",
    url: "https://example.com/files/bao-cao-tham-dinh.pdf",
  },
  {
    name: "Hop-dong-mau.pdf",
    url: "https://example.com/files/hop-dong-mau.pdf",
  },
];

const ContractDetailPage = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [contract, setContract] = useState<ContractData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingContract, setEditingContract] = useState<ContractData | null>(
    null,
  );

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

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-lg bg-white p-5 ring-1 ring-foreground/10">
          <div className="mb-4 flex items-center gap-2">
            <Gavel className="h-5 w-5 text-violet-600" />
            <h2 className="text-lg font-semibold">Thông tin đấu giá</h2>
            <Badge className={getStatusClassName(contract.status)}>
              {CONTRACT_STATUS_LABELS[contract.status]}
            </Badge>
          </div>
          <div className="space-y-3">
            <DetailRow label="Số quy chế" value={contract.regulationNumber} />
            <DetailRow label="Tên tài sản" value={contract.title} />
            <DetailRow
              label="Giá khởi điểm"
              value={formatCurrency(contract.startingPrice)}
            />
            <DetailRow
              label="Tiền đặt cọc"
              value={formatCurrency(contract.deposit)}
            />
            <DetailRow
              label="Phí hồ sơ"
              value={formatCurrency(contract.applicationFee)}
            />
          </div>
        </section>
        <div className="space-y-4 h-full ">
          <section className="rounded-lg bg-white p-5 ring-1 ring-foreground/10">
            <div className="mb-4 flex items-center gap-2">
              <UserRound className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold">Phân công</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <InfoBlock
                label="Đấu giá viên"
                value={getUserDisplayName(contract.auctioneer)}
              />
              <InfoBlock
                label="Thư ký"
                value={getUserDisplayName(contract.secretary)}
              />
              <InfoBlock
                label="Người tạo"
                value={getUserDisplayName(contract.createdBy)}
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
                label="Thời gian đăng ký"
                value={`${formatDate(contract.registerStartDate)} - ${formatDate(contract.registerExpiredDate)}`}
              />
              <InfoBlock
                label={`Thời gian đấu giá (${contract.auctionTime} phút)`}
                value={`${formatDate(contract.auctionDate)} - ${formatDate(
                  String(
                    new Date(
                      new Date(contract.auctionDate).getTime() +
                        contract.auctionTime * 60000,
                    ),
                  ),
                )}`}
              />
            </div>
          </section>
        </div>
      </div>

      <section className="rounded-lg bg-white p-5 ring-1 ring-foreground/10">
        <div className="flex justify-between">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-700" />
            <h2 className="text-lg font-semibold">Tài liệu</h2>
          </div>
          <Button>
            <Upload className="h-4 w-4" />
            Tải lên
          </Button>
        </div>
        {contract.fileUrl ? (
          <div className="space-y-3">
            {mockfile.map((file, index) => (
              <div key={index}>
                <div className="flex items-center justify-between gap-4 py-2">
                  <span className="text-sm text-muted-foreground">
                    {file.name}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
                <Separator />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Chưa có tài liệu đính kèm.
            </p>
          </div>
        )}
      </section>

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
