import { useEffect, useRef, useState } from "react";
import { getResource } from "@/lib/api/resource/resource.api";
import { ContractStatus } from "@/lib/enums/contract.enum";
import {
  contractAuctionTerms,
  contractAutofill,
} from "@/lib/helper/auction-form.helper";
import type { ResourceName } from "@/lib/types/resource.type";
import type { ResourceField } from "../resource-field";
import {
  errorMessage,
  toInputValue,
  type FormValues,
  type SetFormValues,
} from "./form-values";

export function useContractContext(
  resource: ResourceName,
  fields: ResourceField[],
  form: FormValues,
  setForm: SetFormValues,
  setDepositPercentInput: (value: string | null) => void,
) {
  const [checkingContract, setCheckingContract] = useState(false);
  const [contractMessage, setContractMessage] = useState("");
  const [contractContext, setContractContext] = useState<{
    id: number;
    terms: Record<string, unknown>;
  } | null>(null);
  const contractTerms =
    contractContext?.id === Number(form.contractId)
      ? contractContext.terms
      : null;
  const previousContractId = useRef(form.contractId);
  const [contractLookupRevision, setContractLookupRevision] = useState(0);
  const needsContractTerms = [
    "regulation",
    "announcement",
    "auction-registration",
    "auction-result",
  ].includes(resource);

  useEffect(() => {
    if (!needsContractTerms || !form.contractId) return;
    const id = Number(form.contractId);
    const autofill = previousContractId.current !== form.contractId;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setCheckingContract(true);
      setContractMessage("");
      try {
        const contract = await getResource(
          resource === "auction-registration"
            ? "auction-registration/contracts"
            : "contract",
          id,
        );
        if (cancelled) return;
        if (
          resource === "auction-result" &&
          autofill &&
          contract.contractStatus !== ContractStatus.DAU_GIA_THANH
        ) {
          setContractMessage(
            'Chỉ được chọn hợp đồng có trạng thái "Đấu giá thành".',
          );
          return;
        }
        previousContractId.current = String(id);
        setContractContext({ id, terms: contractAuctionTerms(contract) });
        if (autofill) {
          const source = contractAutofill(contract, resource);
          const keys =
            resource === "auction-registration"
              ? ["registrationFee", "depositAmount"]
              : resource === "auction-result"
                ? ["winningPrice"]
                : [
                    "startingPrice",
                    "stepPrice",
                    "registrationFee",
                    "depositAmount",
                    "startRegisterDate",
                    "endRegisterDate",
                    "auctionDate",
                    "auctionFormat",
                    "auctionMethod",
                  ];
          const values = Object.fromEntries(
            fields
              .filter(
                (field) =>
                  keys.includes(field.key) &&
                  (source[field.key] != null ||
                    resource === "auction-registration" ||
                    resource === "auction-result"),
              )
              .map((field) => [
                field.key,
                toInputValue(source[field.key], field.kind),
              ]),
          );
          setForm((current) =>
            Number(current.contractId) === id
              ? { ...current, ...values }
              : current,
          );
          setDepositPercentInput(null);
        }
      } catch (error) {
        if (!cancelled)
          setContractMessage(
            errorMessage(error) ??
              "Không thể tải thông tin hợp đồng. Vui lòng chọn lại hợp đồng.",
          );
      } finally {
        if (!cancelled) setCheckingContract(false);
      }
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    resource,
    fields,
    form.contractId,
    needsContractTerms,
    contractLookupRevision,
    setForm,
    setDepositPercentInput,
  ]);

  const selectContract = (value: string) => {
    setForm((current) => ({ ...current, contractId: value }));
    setContractMessage("");
    setContractContext(null);
    setCheckingContract(false);
    if (!value) previousContractId.current = "";
    setContractLookupRevision((revision) => revision + 1);
  };
  return {
    contractTerms,
    checkingContract,
    contractMessage,
    needsContractTerms,
    selectContract,
    retryContract: () => setContractLookupRevision((revision) => revision + 1),
  };
}
