import axios from "axios";
import api from "../api";
import { Response } from "@/lib/types/reponse.type";
import { FileEntityType, ManagedFile } from "@/lib/types/file.type";

interface PresignedUpload {
  fileId: number;
  uploadUrl: string;
  s3Key: string;
}

export async function uploadEntityFile(
  file: File,
  entityType: FileEntityType,
  entityId: number,
) {
  const response = await api.post<Response<PresignedUpload>>(
    "/files/presigned-upload-url",
    {
      fileName: file.name,
      fileType: file.type || "application/octet-stream",
      entityType,
      entityId,
    },
  );
  const pending = response.data.data;

  await axios.put(pending.uploadUrl, file, {
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
  });

  const confirmation = await api.post<Response<ManagedFile>>(
    `/files/${pending.fileId}/confirm`,
    {},
  );
  return confirmation.data.data;
}

export async function deleteFile(fileId: number) {
  await api.delete(`/files/${fileId}`);
}
