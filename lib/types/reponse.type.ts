export interface Response<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 1,
};
