import { ResourceItem } from "@/lib/types/resource.type";
import { formatDate } from "./date-formatter.helper";

export function contractLabel(item: ResourceItem): string {
  if (item.contractNumber) return String(item.contractNumber);
  const parent = item.parentContract as ResourceItem | null | undefined;
  return item.parentContractId
    ? `HĐ sửa đổi từ hợp đồng số ${parent?.contractNumber || "Chưa có số hợp đồng"} - Ngày ${formatDate(item?.contractDate as string) || "Chưa có ngày hợp đồng"}`
    : `Hợp đồng #${item.id}`;
}
