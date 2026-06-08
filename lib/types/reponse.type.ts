export interface Response<T> {
  status: string;
  statusCode: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> extends Response<T> {
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}
