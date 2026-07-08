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
