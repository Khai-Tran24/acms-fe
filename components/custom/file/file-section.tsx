"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deleteFile, uploadEntityFile } from "@/lib/api/file/file.api";
import { FileEntityType, ManagedFile } from "@/lib/types/file.type";
import { Download, FileText, LoaderCircle, Trash2, Upload } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";

const formatSize = (size: number | string) => {
  const bytes = Number(size);
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 3);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
};

const errorMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } }).response?.data
    ?.message ?? fallback;

export function FileSection({
  entityType,
  entityId,
  files,
  onChanged,
}: {
  entityType: FileEntityType;
  entityId: number;
  files: ManagedFile[];
  onChanged: () => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      await uploadEntityFile(file, entityType, entityId);
      await onChanged();
      toast.success("Tải tệp lên thành công.");
    } catch (error) {
      toast.error(errorMessage(error, "Không thể tải tệp lên."));
    } finally {
      setUploading(false);
    }
  };

  const remove = async (file: ManagedFile) => {
    if (!window.confirm(`Xóa tệp “${file.originalName}”?`)) return;
    setDeletingId(file.id);
    try {
      await deleteFile(file.id);
      await onChanged();
      toast.success("Đã xóa tệp.");
    } catch (error) {
      toast.error(errorMessage(error, "Không thể xóa tệp."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tệp đính kèm</CardTitle>
        <CardAction>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={upload}
            disabled={uploading}
          />
          <Button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Upload />
            )}
            {uploading ? "Đang tải lên..." : "Tải tệp lên"}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Chưa có tệp đính kèm.
          </div>
        ) : (
          <ul className="divide-y rounded-lg border">
            {files.map((file) => (
              <li
                key={file.id}
                className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center"
              >
                <FileText className="size-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{file.originalName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(file.fileSize)} · {file.mimeType}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {file.downloadUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={file.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download />
                        Xem
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(file)}
                    disabled={deletingId === file.id}
                    aria-label={`Xóa ${file.originalName}`}
                  >
                    {deletingId === file.id ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      <Trash2 />
                    )}
                    Xóa
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
