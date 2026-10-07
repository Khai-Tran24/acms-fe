import { auctionPriceGap } from "@/lib/helper/auction-finance.helper";
import { formatCurrency } from "@/lib/helper/currency-exchange.helper";

export function AuctionPriceComparison({
  startingPrice,
  winningPrice,
}: {
  startingPrice: unknown;
  winningPrice: unknown;
}) {
  const gap = auctionPriceGap(startingPrice, winningPrice);
  const hasStartingPrice =
    startingPrice != null &&
    startingPrice !== "" &&
    Number.isFinite(Number(startingPrice));
  return (
    <dl
      className="grid gap-3 rounded-lg border bg-muted/30 p-3 sm:grid-cols-2"
      aria-live="polite"
    >
      <div>
        <dt className="text-sm text-muted-foreground">Giá khởi điểm</dt>
        <dd className="mt-1 font-semibold">
          {hasStartingPrice ? formatCurrency(Number(startingPrice)) : "—"}
        </dd>
      </div>
      <div>
        <dt className="text-sm text-muted-foreground">
          Chênh lệch giá (giá trúng − giá khởi điểm)
        </dt>
        <dd className="mt-1 font-semibold">
          {gap === null ? "—" : formatCurrency(gap)}
        </dd>
      </div>
    </dl>
  );
}
