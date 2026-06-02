export interface Response<T> {
  status: string;
  statusCode: number;
  message: string;
  data: T;
}
