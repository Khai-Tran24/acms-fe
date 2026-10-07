import { useRef, useState } from "react";
import { getResource } from "@/lib/api/resource/resource.api";
import { useToast } from "@/lib/hooks/use-toast";
import type { ResourceItem } from "@/lib/types/resource.type";
import type { ResourceField } from "../resource-field";
import {
  errorMessage,
  linkedProperties,
  parentFormValues,
  type SetFormValues,
} from "./form-values";

export function useParentContract(
  fields: ResourceField[],
  editing: ResourceItem | null,
  setForm: SetFormValues,
) {
  const toastRef = useRef(useToast());
  const requestId = useRef(0);
  const [loadingParent, setLoadingParent] = useState(false);
  const [contractProperties, setContractProperties] = useState(() =>
    linkedProperties(editing),
  );
  const selectParent = async (value: string) => {
    const request = ++requestId.current;
    setForm((current) => ({ ...current, parentContractId: value }));
    setLoadingParent(Boolean(value) && !editing);
    // Editing a saved child must not overwrite its own terms or assets.
    if (!value || editing) return;
    try {
      const parent = await getResource("contract", Number(value));
      if (request !== requestId.current) return;
      setContractProperties(linkedProperties(parent));
      setForm((current) => ({
        ...current,
        ...parentFormValues(fields, parent),
      }));
    } catch (error) {
      if (request !== requestId.current) return;
      setForm((current) => ({ ...current, parentContractId: "" }));
      toastRef.current.error(
        errorMessage(error) ?? "Không thể tải hợp đồng cha.",
      );
    } finally {
      if (request === requestId.current) setLoadingParent(false);
    }
  };
  return {
    loadingParent,
    selectParent,
    contractProperties,
    setContractProperties,
  };
}
