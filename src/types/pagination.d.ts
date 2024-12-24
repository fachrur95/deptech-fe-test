export declare type MetaType = {
  first: number;
  last: number;
  currentPage: number;
  maxPages: number;
  limit: number;
  count: number;
  total?: number;
};

export declare type PaginationResponse<T> = {
  meta: MetaType;
  data: T[];
};
