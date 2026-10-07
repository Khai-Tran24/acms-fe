"use client";

import Link from "next/link";
import { contractLabel } from "@/lib/helper/contract-label.helper";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getResource } from "@/lib/api/resource/resource.api";
import { ResourceItem, ResourceName } from "@/lib/types/resource.type";
import {
  ArrowLeft,
  CircleAlert,
  FileText,
  Pencil,
  RefreshCw,
} from "lucide-react";
import { ContractStatusBadge as StatusBadge } from "@/components/custom/contract/contract-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ResourceFormDialog } from "./resource-form-dialog";
import { resourceConfigs } from "./resource-fields";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FileSection } from "@/components/custom/file/file-section";
import { FileEntityType, ManagedFile } from "@/lib/types/file.type";
import { AuctionFinancialSummary } from "./auction-financial-summary";
import { DetailSections } from "./detail/detail-sections";

const fileEntityTypes: Partial<Record<ResourceName, FileEntityType>> = {
  contract: "CONTRACT",
  regulation: "REGULATION",
  announcement: "ANNOUNCEMENT",
  "auction-result": "AUCTION_RESULT",
};

export function ResourceDetail({
  resource,
  title,
}: {
  resource: ResourceName;
  title: string;
}) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<ResourceItem | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const config = resourceConfigs[resource];

  delete item?.announcements;

  const loadItem = useCallback(async () => {
    try {
      const data = await getResource(resource, Number(params.id));
      setItem(data);
      setError("");
    } catch {
      setError("Không thể tải lại dữ liệu. Vui lòng thử lại.");
    }
  }, [params.id, resource]);

  useEffect(() => {
    let active = true;
    getResource(resource, Number(params.id))
      .then((data) => active && setItem(data))
      .catch(
        (reason: unknown) =>
          active &&
          setError(
            (reason as { response?: { data?: { message?: string } } }).response
              ?.data?.message ?? "Không thể tải dữ liệu.",
          ),
      );
    return () => {
      active = false;
    };
  }, [params.id, resource]);

  const entityType = fileEntityTypes[resource];
  const files = Array.isArray(item?.files) ? (item.files as ManagedFile[]) : [];

  const recordName =
    item &&
    (resource === "contract"
      ? contractLabel(item)
      : (item.contractNumber ??
        item.propertyName ??
        item.regulationNumber ??
        item.announcementNumber ??
        item.auctionResultNumber ??
        item.fullName));

  return (
    <div className="page-container">
      <Button
        variant="ghost"
        className="-ml-3 text-muted-foreground"
        onClick={() => router.back()}
      >
        <ArrowLeft className="size-4" /> Quay lại danh sách
      </Button>
      <header className="flex flex-col gap-5 rounded-2xl border bg-gradient-to-br from-primary/5 via-card to-card p-5 md:p-7 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="hidden rounded-xl bg-primary/10 p-3 text-primary sm:block">
            <FileText className="size-6" aria-hidden="true" />
          </span>
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h1 className="break-words text-2xl font-bold tracking-tight md:text-3xl">
              {recordName ? String(recordName) : title}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              {item && (
                <span className="text-xs text-muted-foreground">
                  Mã hồ sơ #{item.id}
                </span>
              )}
              {item?.contractStatus != null && (
                <StatusBadge value={item.contractStatus} />
              )}
            </div>
          </div>
        </div>
        <Button
          className="shrink-0"
          disabled={!item || Boolean(error)}
          onClick={() => setEditing(true)}
        >
          <Pencil className="size-4" /> Chỉnh sửa
        </Button>
      </header>
      {error ? (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-xl border bg-card p-8 text-center"
        >
          <CircleAlert className="size-8 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" onClick={() => void loadItem()}>
            <RefreshCw className="size-4" /> Thử lại
          </Button>
        </div>
      ) : item ? (
        <>
          {resource === "auction-result" && (
            <AuctionFinancialSummary item={item} />
          )}
          {resource === "contract" && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold">Hợp đồng liên quan</h2>
              </CardHeader>
              <CardContent className="space-y-3">
                {item.parentContract ? (
                  <p>
                    Hợp đồng cha:{" "}
                    <Link
                      className="text-primary underline"
                      href={`/contracts/${(item.parentContract as ResourceItem).id}`}
                    >
                      {contractLabel(item.parentContract as ResourceItem)}
                    </Link>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Hợp đồng mới, không có hợp đồng cha.
                  </p>
                )}
                {(item.childContracts as ResourceItem[] | undefined)?.map(
                  (child) => (
                    <p key={child.id}>
                      Hợp đồng sửa đổi:{" "}
                      <Link
                        className="text-primary underline"
                        href={`/contracts/${child.id}`}
                      >
                        {contractLabel(child)}
                      </Link>
                    </p>
                  ),
                )}
              </CardContent>
            </Card>
          )}
          <DetailSections item={item} resource={resource} />
        </>
      ) : (
        <div
          role="status"
          aria-label="Đang tải thông tin"
          className="space-y-6"
        >
          <span className="sr-only">Đang tải thông tin...</span>
          {[0, 1].map((index) => (
            <div key={index} className="space-y-5 rounded-xl border p-6">
              <Skeleton className="h-6 w-48" />
              <div className="grid gap-5 sm:grid-cols-2">
                {[0, 1, 2, 3].map((field) => (
                  <Skeleton key={field} className="h-12 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {item && entityType && (
        <FileSection
          entityType={entityType}
          entityId={item.id}
          files={files}
          onChanged={loadItem}
        />
      )}
      {editing && item && (
        <ResourceFormDialog
          resource={resource}
          singular={config.singular}
          fields={config.fields}
          editing={item}
          onClose={() => setEditing(false)}
          onSaved={loadItem}
        />
      )}
    </div>
  );
}
