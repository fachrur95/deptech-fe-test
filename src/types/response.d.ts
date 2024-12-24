export declare interface IResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error: object | string | null;
}
