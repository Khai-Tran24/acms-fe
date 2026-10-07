export const auctionCostTotal = (value: unknown) => {
  if (!Array.isArray(value)) return 0;

  return value.reduce((total, item) => {
    if (!item || typeof item !== "object") return total;
    const amount = Number((item as Record<string, unknown>).amount ?? 0);
    return total + (Number.isFinite(amount) ? amount : 0);
  }, 0);
};

export const auctionFinalPrice = (
  winningPrice: unknown,
  auctionCost: unknown,
) => {
  const price = Number(winningPrice ?? 0);
  return (Number.isFinite(price) ? price : 0) - auctionCostTotal(auctionCost);
};

/** Return no comparison until both amounts are available (zero is valid). */
export const auctionPriceGap = (
  startingPrice: unknown,
  winningPrice: unknown,
) => {
  if (
    startingPrice == null ||
    startingPrice === "" ||
    winningPrice == null ||
    winningPrice === ""
  )
    return null;
  const start = Number(startingPrice);
  const winning = Number(winningPrice);
  return Number.isFinite(start) && Number.isFinite(winning)
    ? winning - start
    : null;
};
