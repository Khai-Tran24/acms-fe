"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getResource, getResources } from "@/lib/api/resource/resource.api";
import { ResourceItem } from "@/lib/types/resource.type";
import { cn } from "@/lib/utils";
import {
  contractSelectionQuery,
  type ContractSelection,
} from "@/lib/helper/contract-selection.helper";

import { contractLabel } from "@/lib/helper/contract-label.helper";

interface ResourceSearchSelectProps {
  id: string;
  resource: "contract" | "user" | "property";
  value: string;
  onValueChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  contractSelection?: ContractSelection;
  excludedId?: number;
  registrationContracts?: boolean;
}

function optionLabel(
  resource: ResourceSearchSelectProps["resource"],
  item: ResourceItem,
) {
  if (resource === "property")
    return String(item.propertyName || `#${item.id}`);
  return resource === "contract"
    ? contractLabel(item)
    : String(item.fullName || item.username || `#${item.id}`);
}

function optionDescription(
  resource: ResourceSearchSelectProps["resource"],
  item: ResourceItem,
) {
  if (resource === "property") return String(item.propertyLocation || "");
  return resource === "contract"
    ? item.parentContractId
      ? "Hợp đồng sửa đổi bổ sung"
      : "Hợp đồng mới"
    : [item.username, item.email].filter(Boolean).join(" · ");
}

export function ResourceSearchSelect({
  id,
  resource,
  value,
  onValueChange,
  required,
  disabled,
  contractSelection,
  excludedId,
  registrationContracts = false,
}: ResourceSearchSelectProps) {
  const apiResource = registrationContracts
    ? "auction-registration/contracts"
    : resource;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [selected, setSelected] = useState<ResourceItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const placeholder =
    resource === "contract"
      ? "Chọn hợp đồng"
      : resource === "property"
        ? "Chọn tài sản"
        : "Chọn người dùng";
  const searchPlaceholder =
    resource === "contract"
      ? "Tìm theo số hợp đồng hoặc tài sản..."
      : resource === "property"
        ? "Tìm tài sản..."
        : "Tìm theo tên, tài khoản hoặc email...";

  // Resolve existing/default values even when they are outside the first page.
  useEffect(() => {
    if (!value || String(selected?.id) === value) return;
    let cancelled = false;
    getResource(apiResource, Number(value))
      .then((item) => {
        if (!cancelled) setSelected(item);
      })
      .catch(() => {
        // Keep the saved ID visible if its label cannot be loaded.
      });
    return () => {
      cancelled = true;
    };
  }, [apiResource, value, selected?.id]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const timer = window.setTimeout(
      async () => {
        try {
          const result = await getResources(apiResource, {
            page,
            limit: 20,
            search: search.trim() || undefined,
            ...(resource === "contract" && !registrationContracts
              ? contractSelectionQuery(contractSelection)
              : {}),
          });
          if (cancelled) return;
          setItems((current) =>
            page === 1
              ? result.items.filter((item) => item.id !== excludedId)
              : [
                  ...current,
                  ...result.items.filter(
                    (item) =>
                      item.id !== excludedId &&
                      !current.some((existing) => existing.id === item.id),
                  ),
                ],
          );
          setHasMore(page < result.pagination.totalPages);
        } catch {
          if (!cancelled) setError(true);
        } finally {
          if (!cancelled) setLoading(false);
        }
      },
      search ? 300 : 0,
    );
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    open,
    resource,
    apiResource,
    search,
    page,
    retry,
    contractSelection,
    excludedId,
    registrationContracts,
  ]);

  useEffect(() => {
    if (activeIndex >= 0) {
      document
        .getElementById(`${listId}-${activeIndex}`)
        ?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, listId]);

  const choose = (item: ResourceItem) => {
    setSelected(item);
    onValueChange(String(item.id));
    setOpen(false);
  };

  const selectedLabel = value
    ? selected && String(selected.id) === value
      ? optionLabel(resource, selected)
      : `#${value}`
    : placeholder;

  return (
    <Popover
      modal
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setSearch("");
          setPage(1);
          setItems([]);
          setHasMore(false);
          setError(false);
          setLoading(true);
          setActiveIndex(-1);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className="h-10 w-full min-w-0 justify-between font-normal"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {selectedLabel}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        aria-label={placeholder}
        className="w-[var(--radix-popover-trigger-width)] gap-0 overflow-hidden p-0"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <div className="shrink-0 border-b p-2">
          <Input
            ref={inputRef}
            value={search}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-required={required}
            aria-activedescendant={
              activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
            }
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
              setItems([]);
              setHasMore(false);
              setLoading(true);
              setError(false);
              setActiveIndex(-1);
              if (listRef.current) listRef.current.scrollTop = 0;
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((index) =>
                  event.key === "ArrowDown"
                    ? Math.min(index + 1, items.length - 1)
                    : Math.max(index - 1, items.length ? 0 : -1),
                );
              } else if (event.key === "Enter") {
                event.preventDefault();
                if (items[activeIndex]) choose(items[activeIndex]);
              }
            }}
          />
        </div>
        <div
          ref={listRef}
          className="h-60 max-h-[min(15rem,calc(var(--radix-popover-content-available-height)-4rem))] overflow-y-auto overscroll-contain p-1"
        >
          <div
            id={listId}
            role="listbox"
            aria-label={placeholder}
            aria-busy={loading}
          >
            {items.map((item, index) => (
              <div
                key={item.id}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={String(item.id) === value}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent",
                  activeIndex === index && "bg-accent",
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(item)}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate">{optionLabel(resource, item)}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {optionDescription(resource, item)}
                  </div>
                </div>
                {String(item.id) === value && (
                  <Check className="size-4 shrink-0" />
                )}
              </div>
            ))}
          </div>
          {loading && (
            <div
              role="status"
              className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground"
            >
              <Loader2 className="size-4 animate-spin" />
              Đang tải...
            </div>
          )}
          {!loading && error && (
            <div role="alert" className="p-3 text-center text-sm">
              Không thể tải danh sách.
              <Button
                type="button"
                variant="link"
                onClick={() => {
                  setError(false);
                  setLoading(true);
                  setRetry((count) => count + 1);
                }}
              >
                Thử lại
              </Button>
            </div>
          )}
          {!loading && !error && items.length === 0 && (
            <p
              role="status"
              className="p-4 text-center text-sm text-muted-foreground"
            >
              Không tìm thấy kết quả.
            </p>
          )}
          {!loading && !error && hasMore && (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setLoading(true);
                setPage((current) => current + 1);
              }}
            >
              Tải thêm kết quả
            </Button>
          )}
        </div>
        {!required && value && (
          <Button
            type="button"
            variant="ghost"
            className="shrink-0 border-t"
            onClick={() => {
              onValueChange("");
              setSelected(null);
              setOpen(false);
            }}
          >
            Bỏ chọn
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
