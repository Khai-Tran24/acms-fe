import { ContractStatus } from "../enums/contract.enum";
import type { ResourceQuery } from "../types/resource.type";

export type ContractSelection = "parent" | "active" | "successful";

export function contractSelectionQuery(
  selection?: ContractSelection,
): Partial<ResourceQuery> {
  switch (selection) {
    case "parent":
      return { selectableOnly: true, contractType: "HOP_DONG_MOI" };
    case "active":
      return { selectableOnly: true };
    case "successful":
      return { contractStatus: ContractStatus.DAU_GIA_THANH };
    default:
      return {};
  }
}
