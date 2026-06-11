"use client";

import { createContract } from "@/lib/api/contract/contract.api";
import { useToast } from "@/lib/hooks/use-toast";
import { ContractPayload } from "@/lib/types/contract.type";
import { useState } from "react";
import { ContractForm } from "./contract-form";

interface CreateContractModalProps {
  onSuccess: () => void;
  setOpen: (open: boolean) => void;
}

export const CreateContractModal = ({
  onSuccess,
  setOpen,
}: CreateContractModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleCreate = async (payload: ContractPayload) => {
    setIsSubmitting(true);
    try {
      const response = await createContract(payload);
      if (response.status === "success") {
        toast.success("Hợp đồng đã được tạo thành công.");
        setOpen(false);
        onSuccess();
      } else {
        toast.error(response.message || "Có lỗi xảy ra khi tạo hợp đồng.");
      }
    } catch (error) {
      toast.error(
        (error as Error).message || "Có lỗi xảy ra khi tạo hợp đồng.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ContractForm
      submitLabel="Tạo hợp đồng"
      isSubmitting={isSubmitting}
      onSubmit={handleCreate}
    />
  );
};
