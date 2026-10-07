import {
  auctionCostTotal,
  auctionFinalPrice,
} from "@/lib/helper/auction-finance.helper";
import { formatCurrency } from "@/lib/helper/currency-exchange.helper";
import type { ResourceItem } from "@/lib/types/resource.type";
import { AuctionPriceComparison } from "./auction-price-comparison";

export function AuctionFinancialSummary({ item }: { item: ResourceItem }) {
  const winningPrice = Number(item.winningPrice ?? 0);
  const totalCost = auctionCostTotal(item.auctionCost);
  const finalPrice = auctionFinalPrice(item.winningPrice, item.auctionCost);
  const costs = Array.isArray(item.auctionCost)
    ? (item.auctionCost as Record<string, unknown>[])
    : [];

  return (
    <section className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
      <h2 className="font-semibold">Thông tin tài chính đấu giá</h2>
      <AuctionPriceComparison
        startingPrice={item.startingPrice}
        winningPrice={item.winningPrice}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-background p-3">
          <p className="text-xs text-muted-foreground">Giá trúng đấu giá</p>
          <p className="mt-1 font-semibold">{formatCurrency(winningPrice)}</p>
        </div>
        <div className="rounded-lg border bg-background p-3">
          <p className="text-xs text-muted-foreground">
            Tổng các chi phí, phụ phí phải trả
          </p>
          <p className="mt-1 font-semibold text-destructive">
            − {formatCurrency(totalCost)}
          </p>
        </div>
        <div className="rounded-lg border border-success/15 bg-success-soft p-3">
          <p className="text-xs text-success">Số tiền còn lại sau khi trừ</p>
          <p className="mt-1 text-lg font-bold text-success">
            {formatCurrency(finalPrice)}
          </p>
        </div>
      </div>
      {costs.length > 0 && (
        <div className="space-y-2 border-t pt-3">
          {costs.map((cost, index) => (
            <div
              key={`${String(cost.name ?? "cost")}-${index}`}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <span>{String(cost.name ?? `Khoản chi ${index + 1}`)}</span>
              <span className="font-medium">
                {formatCurrency(Number(cost.amount ?? 0))}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
