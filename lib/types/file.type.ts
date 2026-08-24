export type FileEntityType =
  | "CONTRACT"
  | "REGULATION"
  | "ANNOUNCEMENT"
  | "AUCTION_RESULT";

export interface ManagedFile {
  id: number;
  originalName: string;
  mimeType: string;
  fileSize: number | string;
  status: "PENDING" | "ACTIVE" | "DELETED";
  downloadUrl?: string;
  createdAt: string;
}
