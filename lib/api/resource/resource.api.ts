import { Response } from "@/lib/types/reponse.type";
import {
  ResourceItem,
  ResourceList,
  ResourceName,
  ResourceQuery,
} from "@/lib/types/resource.type";
import api from "../api";

const normalizeList = (list: {
  items?: ResourceItem[];
  pagination?: Record<string, number>;
}): ResourceList => ({
  items: list.items ?? [],
  pagination: {
    page: list.pagination?.page ?? 1,
    limit: list.pagination?.limit ?? 10,
    totalItems:
      list.pagination?.totalItems ?? list.pagination?.total ?? 0,
    totalPages: list.pagination?.totalPages ?? 1,
  },
});

export async function getResources(
  resource: ResourceName,
  query: ResourceQuery,
) {
  const response = await api.get(`/` + resource, { params: query });
  const envelope = response.data as Response<Parameters<typeof normalizeList>[0]>;
  return normalizeList(envelope.data);
}

export async function getResource(resource: ResourceName, id: number) {
  const response = await api.get(`/${resource}/${id}`);
  return (response.data as Response<ResourceItem>).data;
}

export async function createResource(
  resource: ResourceName,
  payload: Record<string, unknown>,
) {
  const response = await api.post(`/` + resource, payload);
  return (response.data as Response<ResourceItem>).data;
}

export async function updateResource(
  resource: ResourceName,
  id: number,
  payload: Record<string, unknown>,
) {
  const response = await api.patch(`/${resource}/${id}`, payload);
  return (response.data as Response<ResourceItem>).data;
}

export async function deleteResource(resource: ResourceName, id: number) {
  await api.delete(`/${resource}/${id}`);
}
