"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContractPropertyEditor } from "./form/contract-property-editor";
import { ResourceFormField } from "./form/resource-form-field";
import {
  useResourceForm,
  type ResourceFormOptions,
} from "./form/use-resource-form";

export function ResourceFormDialog(props: ResourceFormOptions) {
  const { resource, singular, editing, onClose } = props;
  const model = useResourceForm(props);
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !model.busy) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Chỉnh sửa" : "Thêm"} {singular}
          </DialogTitle>
          <DialogDescription>
            Các trường có dấu * là bắt buộc.
          </DialogDescription>
        </DialogHeader>
        <fieldset
          disabled={model.busy}
          className="min-w-0 gap-4 py-2 -mx-4 max-h-[60vh] overflow-y-auto px-4 space-y-4"
        >
          {model.formFields.map((field) => (
            <ResourceFormField
              key={field.key}
              field={field}
              resource={resource}
              editing={editing}
              model={model}
            />
          ))}
          {resource === "contract" && (
            <ContractPropertyEditor
              contractProperties={model.contractProperties}
              setContractProperties={model.setContractProperties}
              creatingProperty={model.creatingProperty}
              setCreatingProperty={model.setCreatingProperty}
              saving={model.saving}
            />
          )}
        </fieldset>
        <DialogFooter>
          <Button variant="outline" disabled={model.busy} onClick={onClose}>
            Hủy
          </Button>
          <Button disabled={!model.canSave} onClick={model.save}>
            {model.saving ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
