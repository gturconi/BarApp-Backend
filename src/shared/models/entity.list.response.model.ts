export class EntityListResponse<T> {
  constructor(
    public results: T[],
    public count: number,
    public currentPage: number,
    public totalPages: number
  ) {}
}
