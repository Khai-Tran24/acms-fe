import { useRef, useState } from "react";
import {
  createResource,
  updateResource,
} from "@/lib/api/resource/resource.api";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/hooks/use-toast";
import {
  auctionFormErrors,
  depositPercentage,
} from "@/lib/helper/auction-form.helper";
import type { ResourceItem, ResourceName } from "@/lib/types/resource.type";
import type { ResourceField } from "../resource-field";
import {
  emptyForm,
  itemFormValues,
  errorMessage,
  resourcePayload,
} from "./form-values";
import { useParentContract } from "./use-parent-contract";
import { useContractContext } from "./use-contract-context";

export interface ResourceFormOptions {
  resource: ResourceName;
  singular: string;
  fields: ResourceField[];
  editing: ResourceItem | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}
export function useResourceForm({
  resource,
  singular,
  fields,
  editing,
  onClose,
  onSaved,
}: ResourceFormOptions) {
  const toast = useToast();
  const toastRef = useRef(toast);
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>(() =>
    editing
      ? itemFormValues(fields, editing)
      : {
          ...emptyForm(fields),
          ...(resource === "contract" && user?.id
            ? { assignedToId: String(user.id) }
            : {}),
        },
  );
  const [depositPercentInput, setDepositPercentInput] = useState<string | null>(
    null,
  );
  const depositAmountPercentage =
    depositPercentInput ??
    depositPercentage(form.startingPrice, form.depositAmount);
  const {
    contractTerms,
    checkingContract,
    contractMessage,
    needsContractTerms,
    selectContract,
    retryContract,
  } = useContractContext(
    resource,
    fields,
    form,
    setForm,
    setDepositPercentInput,
  );
  const validationErrors = auctionFormErrors(resource, form, contractTerms);
  const [creatingProperty, setCreatingProperty] = useState(false);
  const {
    loadingParent,
    selectParent,
    contractProperties,
    setContractProperties,
  } = useParentContract(fields, editing, setForm);

  const save = async () => {
    setSaving(true);
    try {
      for (const field of formFields) {
        if (
          field.required &&
          field.kind !== "json" &&
          !(editing && field.key === "password") &&
          !form[field.key]?.trim()
        ) {
          toastRef.current.error(`Vui lòng nhập ${field.label.toLowerCase()}.`);
          return;
        }
      }
      const validationMessage = Object.values(validationErrors)[0];
      if (validationMessage) {
        toastRef.current.error(validationMessage);
        return;
      }
      const data = resourcePayload(fields, form);
      if (resource === "contract") {
        data.propertyIds = contractProperties.map((property) => property.id);
        for (const property of contractProperties) {
          if (property.note !== property.originalNote) {
            await updateResource("property", property.id, {
              propertyNote: property.note,
            });
            setContractProperties((current) =>
              current.map((item) =>
                item.id === property.id
                  ? { ...item, originalNote: property.note }
                  : item,
              ),
            );
          }
        }
      }
      if (editing) {
        if (resource === "user" && !data.password) {
          delete data.password;
          delete data.assignedContractCount;
        }

        await updateResource(resource, editing.id, data);
      } else await createResource(resource, data);
      toastRef.current.success(
        `${editing ? "Cập nhật" : "Tạo"} ${singular} thành công.`,
      );
      await onSaved();
      onClose();
    } catch (error) {
      toastRef.current.error(
        error instanceof SyntaxError
          ? "Dữ liệu JSON không hợp lệ."
          : (errorMessage(error) ?? `Không thể lưu ${singular}.`),
      );
    } finally {
      setSaving(false);
    }
  };

  const formFields = fields.filter((field) => field.form !== false);

  const busy = saving || creatingProperty || loadingParent || checkingContract;
  const canSave =
    !busy &&
    Object.keys(validationErrors).length === 0 &&
    (!needsContractTerms || Boolean(contractTerms)) &&
    !formFields.some(
      (field) =>
        field.required &&
        !(editing && field.key === "password") &&
        !form[field.key],
    );
  return {
    form,
    setForm,
    formFields,
    saving,
    busy,
    canSave,
    save,
    validationErrors,
    depositPercentInput,
    setDepositPercentInput,
    depositAmountPercentage,
    loadingParent,
    selectParent,
    checkingContract,
    contractTerms,
    contractMessage,
    needsContractTerms,
    selectContract,
    retryContract,
    contractProperties,
    setContractProperties,
    creatingProperty,
    setCreatingProperty,
  };
}
export type ResourceFormController = ReturnType<typeof useResourceForm>;
