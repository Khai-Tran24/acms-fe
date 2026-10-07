import type { ResourceItem, ResourceName } from "../types/resource.type";

type Values = Record<string, unknown>;
const latest = (value: unknown): Values =>
  Array.isArray(value)
    ? value.reduce<Values>(
        (result, item) =>
          item &&
          typeof item === "object" &&
          Number(item.id) > Number(result.id ?? -1)
            ? item
            : result,
        {},
      )
    : {};

export function contractAuctionTerms(contract: ResourceItem): Values {
  return {
    ...contract,
    ...latest(contract.regulations),
    ...latest(contract.announcements),
  };
}

export function contractAutofill(
  contract: ResourceItem,
  resource: ResourceName,
): Values {
  if (resource === "regulation") return contract;
  if (resource === "announcement")
    return { ...contract, ...latest(contract.regulations) };
  const terms = contractAuctionTerms(contract);
  if (resource === "auction-registration") {
    return {
      registrationFee: terms.registrationFee,
      depositAmount: terms.depositAmount,
    };
  }
  if (resource === "auction-result")
    return { winningPrice: terms.startingPrice };
  return {};
}

export function depositPercentage(
  startingPrice: string,
  depositAmount: string,
): string {
  return startingPrice && depositAmount && Number(startingPrice) > 0
    ? String(
        Number(
          ((Number(depositAmount) / Number(startingPrice)) * 100).toFixed(6),
        ),
      )
    : "";
}
export function applyDepositPercentage(
  form: Record<string, string>,
  percentage: string,
): Record<string, string> {
  return {
    ...form,
    depositAmount:
      percentage !== "" &&
      Number.isFinite(Number(percentage)) &&
      Boolean(form.startingPrice)
        ? String(
            Math.round((Number(form.startingPrice) * Number(percentage)) / 100),
          )
        : "",
  };
}
export function applyMoneyInput(
  form: Record<string, string>,
  key: string,
  value: string,
  percentage: string | null,
): Record<string, string> {
  const next = { ...form, [key]: value.replace(/\D/g, "") };
  return key === "startingPrice" && percentage !== null
    ? applyDepositPercentage(next, percentage)
    : next;
}

const time = (value: unknown) =>
  value == null || value === "" ? NaN : new Date(String(value)).getTime();

export function auctionFormErrors(
  resource: ResourceName,
  form: Record<string, string>,
  terms: Values | null,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (resource === "regulation") {
    if (
      form.startRegisterDate &&
      form.endRegisterDate &&
      !(time(form.startRegisterDate) < time(form.endRegisterDate))
    )
      errors.endRegisterDate =
        "Ngày kết thúc đăng ký phải sau ngày bắt đầu đăng ký.";
    if (
      form.endRegisterDate &&
      form.auctionDate &&
      !(time(form.endRegisterDate) < time(form.auctionDate))
    )
      errors.auctionDate = "Ngày đấu giá phải sau ngày kết thúc đăng ký.";
    if (
      form.depositAmount !== "" &&
      form.startingPrice !== "" &&
      !(Number(form.depositAmount) < Number(form.startingPrice))
    )
      errors.depositAmount = "Tiền đặt trước phải nhỏ hơn giá khởi điểm.";
  }
  if (resource === "auction-result" && terms) {
    if (
      form.winningPrice !== "" &&
      !(
        terms.startingPrice != null &&
        Number(form.winningPrice) >= Number(terms.startingPrice)
      )
    )
      errors.winningPrice = "Giá trúng phải lớn hơn hoặc bằng giá khởi điểm.";
    if (!Number.isFinite(time(terms.auctionDate)))
      errors.completedAt =
        "Hợp đồng chưa có ngày đấu giá. Vui lòng bổ sung quy chế hoặc thông báo.";
    else if (
      form.completedAt &&
      !(time(form.completedAt) > time(terms.auctionDate))
    )
      errors.completedAt = "Thời gian hoàn tất phải sau ngày đấu giá.";
  }
  return errors;
}
