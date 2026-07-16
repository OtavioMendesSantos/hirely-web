export interface ApiError {
  code: number;
  message: string;
  status: string;
}

export interface ApiErrorResponse {
  error: ApiError;
}
