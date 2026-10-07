import { Button } from "@/components/ui/button";
import { ResourceSearchSelect } from "@/components/custom/input/resource-search-select";
import { X } from "lucide-react";
import { formatDate } from "@/lib/helper/date-formatter.helper";
import type { ResourceItem, ResourceName } from "@/lib/types/resource.type";
import type { ResourceFormController } from "./use-resource-form";

export function ParentContractField({
  id,
  editing,
  model,
}: {
  id: string;
  editing: ResourceItem | null;
  model: ResourceFormController;
}) {
  const { form, loadingParent, selectParent } = model;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <ResourceSearchSelect
            id={id}
            resource="contract"
            value={form.parentContractId}
            excludedId={editing?.id}
            contractSelection="parent"
            disabled={loadingParent}
            onValueChange={(value) => void selectParent(value)}
          />
        </div>
        {form.parentContractId && (
          <Button
            type="button"
            variant="outline"
            disabled={loadingParent}
            aria-label="Bỏ chọn hợp đồng cha"
            onClick={() => void selectParent("")}
          >
            <X /> Bỏ chọn
          </Button>
        )}
      </div>
    </div>
  );
}

export function AuctionContractField({
  id,
  resource,
  required,
  model,
}: {
  id: string;
  resource: ResourceName;
  required?: boolean;
  model: ResourceFormController;
}) {
  const {
    form,
    contractTerms,
    checkingContract,
    contractMessage,
    selectContract,
    retryContract,
  } = model;
  return (
    <div className="space-y-2">
      <ResourceSearchSelect
        id={id}
        resource="contract"
        registrationContracts={resource === "auction-registration"}
        contractSelection={
          resource === "auction-result" ? "successful" : "active"
        }
        value={form.contractId}
        required={required}
        disabled={checkingContract}
        onValueChange={selectContract}
      />
      {resource === "auction-result" && (
        <p className="text-xs text-muted-foreground">
          Chỉ hiển thị hợp đồng có trạng thái “Đấu giá thành”.
        </p>
      )}
      {contractTerms && resource === "auction-result" && (
        <p className="text-xs text-muted-foreground">
          Ngày đấu giá: {formatDate(contractTerms.auctionDate as string)}
        </p>
      )}
      {checkingContract && (
        <p role="status" className="text-xs text-muted-foreground">
          Đang tải thông tin hợp đồng...
        </p>
      )}
      {contractMessage && (
        <p role="status" className="text-xs text-muted-foreground">
          {contractMessage}
          <Button type="button" variant="link" onClick={retryContract}>
            Thử lại
          </Button>
        </p>
      )}
    </div>
  );
}
