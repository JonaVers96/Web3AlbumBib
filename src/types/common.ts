export interface Entity {
  id: number;
}

export interface ListResponse<T> {
  items: T[];
}

export interface PaginatedListResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface IdParams {
  id: number;
}
