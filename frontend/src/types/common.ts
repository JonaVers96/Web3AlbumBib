export interface Entity {
  id: number;
}

export interface PaginatedListResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}
