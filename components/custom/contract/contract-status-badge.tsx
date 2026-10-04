import { Badge } from "@/components/ui/badge";
import { ContractStatus } from "@/lib/enums/contract.enum";
import { cn } from "@/lib/utils";
import { CONTRACT_STATUS_LABELS, getStatusClassName } from "./contract-utils";

export function ContractStatusBadge({ value }: { value: unknown }) {
  const status = String(value ?? "") as ContractStatus;
  return (
    <Badge
      variant="outline"
      className={cn("h-auto max-w-full gap-1.5 border-transparent px-2.5 py-1 text-xs whitespace-normal", getStatusClassName(status))}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />
      {CONTRACT_STATUS_LABELS[status] ?? (status || "Chưa có trạng thái")}
    </Badge>
  );
}
