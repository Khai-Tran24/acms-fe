"use client";

import { updateContract } from "@/lib/api/contract/contract.api";
import { useToast } from "@/lib/hooks/use-toast";
import { ContractData, ContractPayload } from "@/lib/types/contract.type";
import { useState } from "react";
import { ContractForm } from "./contract-form";

interface UpdateContractModalProps {
  contract: ContractData;
  onSuccess: () => void;
  setOpen: (open: boolean) => void;
}

export const UpdateContractModal = ({
  contract,
  onSuccess,
  setOpen,
}: UpdateContractModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleUpdate = async (payload: ContractPayload) => {
    setIsSubmitting(true);
    try {
      const response = await updateContract(contract.id, payload);
      if (response.status === "success") {
        toast.success("Hợp đồng đã được cập nhật thành công.");
        setOpen(false);
        onSuccess();
      } else {
        toast.error(response.message || "Có lỗi xảy ra khi cập nhật hợp đồng.");
      }
    } catch (error) {
      toast.error(
        (error as Error).message || "Có lỗi xảy ra khi cập nhật hợp đồng.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ContractForm
      contract={contract}
      submitLabel="Cập nhật hợp đồng"
      isSubmitting={isSubmitting}
      onSubmit={handleUpdate}
    />
  );
};
