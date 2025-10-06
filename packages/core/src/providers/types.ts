/**
 * Data Provider type definitions
 * Abstracts data fetching operations for different backends
 */

import type { BaseModel } from '../types'

/**
 * Sort direction for queries
 */
export type SortOrder = 'asc' | 'desc'

/**
 * Sort configuration
 */
export interface Sort {
  field: string
  order: SortOrder
}

/**
 * Filter operator
 */
export type FilterOperator =
  | 'eq' // equals
  | 'ne' // not equals
  | 'lt' // less than
  | 'lte' // less than or equal
  | 'gt' // greater than
  | 'gte' // greater than or equal
  | 'in' // in array
  | 'nin' // not in array
  | 'contains' // string contains
  | 'startsWith' // string starts with
  | 'endsWith' // string ends with
  | 'between' // between two values
  | 'null' // is null
  | 'notNull' // is not null

/**
 * Filter configuration
 */
export interface Filter {
  field: string
  operator: FilterOperator
  value: unknown
}

/**
 * Pagination configuration
 */
export interface Pagination {
  page?: number
  perPage?: number
  cursor?: string
}

/**
 * Parameters for getList method
 */
export interface GetListParams {
  pagination?: Pagination
  sort?: Sort | Sort[]
  filter?: Filter | Filter[]
  search?: string
}

/**
 * Result from getList method
 */
export interface GetListResult<TModel extends BaseModel = BaseModel> {
  data: TModel[]
  total: number
  page?: number
  perPage?: number
  pageCount?: number
  cursor?: string
  nextCursor?: string | null
  prevCursor?: string | null
}

/**
 * Parameters for getOne method
 */
export interface GetOneParams {
  meta?: Record<string, unknown>
}

/**
 * Parameters for create method
 */
export interface CreateParams<TModel extends BaseModel = BaseModel> {
  data: Omit<TModel, 'id'> | Partial<TModel>
  meta?: Record<string, unknown>
}

/**
 * Parameters for update method
 */
export interface UpdateParams<TModel extends BaseModel = BaseModel> {
  id: string | number
  data: Partial<TModel>
  previousData?: TModel
  meta?: Record<string, unknown>
}

/**
 * Parameters for delete method
 */
export interface DeleteParams {
  id: string | number
  previousData?: BaseModel
  meta?: Record<string, unknown>
}

/**
 * Parameters for deleteMany method
 */
export interface DeleteManyParams {
  ids: (string | number)[]
  meta?: Record<string, unknown>
}

/**
 * Parameters for updateMany method
 */
export interface UpdateManyParams<TModel extends BaseModel = BaseModel> {
  ids: (string | number)[]
  data: Partial<TModel>
  meta?: Record<string, unknown>
}

/**
 * Data Provider interface
 * All data providers must implement this interface
 */
export interface DataProvider {
  /**
   * Get a list of records
   */
  getList: <TModel extends BaseModel = BaseModel>(
    resource: string,
    params: GetListParams
  ) => Promise<GetListResult<TModel>>

  /**
   * Get a single record by ID
   */
  getOne: <TModel extends BaseModel = BaseModel>(
    resource: string,
    id: string | number,
    params?: GetOneParams
  ) => Promise<TModel>

  /**
   * Create a new record
   */
  create: <TModel extends BaseModel = BaseModel>(
    resource: string,
    params: CreateParams<TModel>
  ) => Promise<TModel>

  /**
   * Update an existing record
   */
  update: <TModel extends BaseModel = BaseModel>(
    resource: string,
    params: UpdateParams<TModel>
  ) => Promise<TModel>

  /**
   * Delete a record
   */
  delete: (resource: string, params: DeleteParams) => Promise<void>

  /**
   * Delete multiple records
   */
  deleteMany: (resource: string, params: DeleteManyParams) => Promise<void>

  /**
   * Update multiple records
   */
  updateMany: <TModel extends BaseModel = BaseModel>(
    resource: string,
    params: UpdateManyParams<TModel>
  ) => Promise<TModel[]>

  /**
   * Custom method for provider-specific operations
   */
  custom?: <TResult = unknown, TPayload = unknown>(
    resource: string,
    method: string,
    payload?: TPayload
  ) => Promise<TResult>
}

/**
 * Data Provider error
 */
export class DataProviderError extends Error {
  public statusCode?: number
  public response?: unknown

  constructor(message: string, statusCode?: number, response?: unknown) {
    super(message)
    this.name = 'DataProviderError'
    this.statusCode = statusCode
    this.response = response
  }
}

/**
 * HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * HTTP client interface
 */
export interface HttpClient {
  request: <T = unknown>(
    url: string,
    options?: {
      method?: HttpMethod
      headers?: Record<string, string>
      body?: unknown
      params?: Record<string, unknown>
    }
  ) => Promise<T>
}
