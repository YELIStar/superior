/** 分页请求参数 */
export interface PaginationRequest {
    page?: number;
    page_size?: number;
    offset?: number;
    limit?: number;
}

/** 分页响应结构 */
export interface PaginationResponse<T> {
    items: T[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_more: boolean;
}

/** 通用API响应结构 */
export interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
    success: boolean;
}

/** 排序方式 */
export enum SortDirection {
    ASC = 'asc',
    DESC = 'desc',
}

/** 排序请求参数 */
export interface SortRequest {
    sort_by?: string;
    sort_dir?: SortDirection;
}