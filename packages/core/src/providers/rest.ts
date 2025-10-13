/**
 * REST Data Provider
 * Implementation of DataProvider for REST APIs
 */

import type {
  DataProvider,
  GetListParams,
  GetListResult,
  GetOneParams,
  CreateParams,
  UpdateParams,
  DeleteParams,
  DeleteManyParams,
  UpdateManyParams,
  HttpClient,
  HttpMethod,
  Sort,
  Filter,
} from './types'
import { DataProviderError } from './types'
import type { BaseModel } from '../types'

/**
 * REST Data Provider configuration
 */
export interface RestDataProviderConfig {
  /** Base URL for the API */
  baseURL: string

  /** Default headers */
  headers?: Record<string, string>

  /** Custom HTTP client (defaults to fetch) */
  httpClient?: HttpClient

  /** Transform request before sending */
  transformRequest?: (url: string, options: RequestInit) => RequestInit

  /** Transform response before returning */
  transformResponse?: <T>(response: Response) => Promise<T>

  /** Pagination strategy */
  pagination?: {
    /** Page parameter name (default: 'page') */
    pageParam?: string
    /** Per page parameter name (default: 'perPage' or 'limit') */
    perPageParam?: string
    /** Cursor parameter name (default: 'cursor') */
    cursorParam?: string
  }

  /** Sort parameter configuration */
  sort?: {
    /** Sort field parameter name (default: 'sortBy' or 'orderBy') */
    fieldParam?: string
    /** Sort order parameter name (default: 'order') */
    orderParam?: string
    /** Separator for multiple sorts (default: ',') */
    separator?: string
  }

  /** Filter parameter configuration */
  filter?: {
    /** Use query parameters for filters (default: true) */
    useQueryParams?: boolean
    /** Filter parameter name prefix (default: 'filter.') */
    paramPrefix?: string
    /** Custom filter serializer */
    serialize?: (filters: Filter | Filter[]) => Record<string, unknown>
  }

  /** Search parameter name (default: 'q' or 'search') */
  searchParam?: string
}

/**
 * Default fetch-based HTTP client
 */
class FetchHttpClient implements HttpClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor(baseURL: string, headers: Record<string, string> = {}) {
    this.baseURL = baseURL
    this.defaultHeaders = headers
  }

  async request<T = unknown>(
    url: string,
    options: {
      method?: HttpMethod
      headers?: Record<string, string>
      body?: unknown
      params?: Record<string, unknown>
    } = {}
  ): Promise<T> {
    const fullURL = new URL(url, this.baseURL)

    // Add query parameters
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          fullURL.searchParams.append(key, String(value))
        }
      })
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.defaultHeaders,
      ...options.headers,
    }

    const fetchOptions: RequestInit = {
      method: options.method || 'GET',
      headers,
    }

    if (options.body && options.method !== 'GET') {
      fetchOptions.body = JSON.stringify(options.body)
    }

    try {
      const response = await fetch(fullURL.toString(), fetchOptions)

      if (!response.ok) {
        const errorBody = await response.text()
        throw new DataProviderError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorBody
        )
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return undefined as T
      }

      const data = await response.json()
      return data as T
    } catch (error) {
      if (error instanceof DataProviderError) {
        throw error
      }
      throw new DataProviderError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      )
    }
  }
}

/**
 * REST Data Provider
 */
export class RestDataProvider implements DataProvider {
  private httpClient: HttpClient
  private config: Required<RestDataProviderConfig>

  constructor(config: RestDataProviderConfig) {
    this.config = {
      baseURL: config.baseURL,
      headers: config.headers || {},
      httpClient: config.httpClient || new FetchHttpClient(config.baseURL, config.headers),
      transformRequest: config.transformRequest || ((url, options) => options),
      transformResponse: config.transformResponse || ((response) => response.json()),
      pagination: {
        pageParam: config.pagination?.pageParam || 'page',
        perPageParam: config.pagination?.perPageParam || 'perPage',
        cursorParam: config.pagination?.cursorParam || 'cursor',
      },
      sort: {
        fieldParam: config.sort?.fieldParam || 'sortBy',
        orderParam: config.sort?.orderParam || 'order',
        separator: config.sort?.separator || ',',
      },
      filter: {
        useQueryParams: config.filter?.useQueryParams ?? true,
        paramPrefix: config.filter?.paramPrefix || 'filter.',
        serialize: config.filter?.serialize || this.defaultFilterSerializer.bind(this),
      },
      searchParam: config.searchParam || 'q',
    }

    this.httpClient = this.config.httpClient
  }

  private defaultFilterSerializer(filters: Filter | Filter[]): Record<string, unknown> {
    const filterArray = Array.isArray(filters) ? filters : [filters]
    const params: Record<string, unknown> = {}

    filterArray.forEach((filter) => {
      const key = `${this.config.filter.paramPrefix}${filter.field}.${filter.operator}`
      params[key] = filter.value
    })

    return params
  }

  private buildSortParams(sort?: Sort | Sort[]): Record<string, string> {
    if (!sort) return {}

    const sortArray = Array.isArray(sort) ? sort : [sort]
    const { fieldParam, orderParam, separator } = this.config.sort

    if (sortArray.length === 0) return {}

    return {
      [fieldParam]: sortArray.map((s) => s.field).join(separator),
      [orderParam]: sortArray.map((s) => s.order).join(separator),
    }
  }

  async getList<TModel extends BaseModel = BaseModel>(
    resource: string,
    params: GetListParams
  ): Promise<GetListResult<TModel>> {
    const queryParams: Record<string, unknown> = {}

    // Pagination
    if (params.pagination) {
      if (params.pagination.cursor) {
        queryParams[this.config.pagination.cursorParam] = params.pagination.cursor
      } else {
        if (params.pagination.page) {
          queryParams[this.config.pagination.pageParam] = params.pagination.page
        }
        if (params.pagination.perPage) {
          queryParams[this.config.pagination.perPageParam] = params.pagination.perPage
        }
      }
    }

    // Sort
    if (params.sort) {
      Object.assign(queryParams, this.buildSortParams(params.sort))
    }

    // Filter
    if (params.filter && this.config.filter.useQueryParams) {
      Object.assign(queryParams, this.config.filter.serialize(params.filter))
    }

    // Search
    if (params.search) {
      queryParams[this.config.searchParam] = params.search
    }

    const response = await this.httpClient.request<GetListResult<TModel>>(
      `/${resource}`,
      {
        method: 'GET',
        params: queryParams,
      }
    )

    return response
  }

  async getOne<TModel extends BaseModel = BaseModel>(
    resource: string,
    id: string | number,
    params?: GetOneParams
  ): Promise<TModel> {
    const response = await this.httpClient.request<TModel>(`/${resource}/${id}`, {
      method: 'GET',
      params: params?.meta,
    })

    return response
  }

  async create<TModel extends BaseModel = BaseModel>(
    resource: string,
    params: CreateParams<TModel>
  ): Promise<TModel> {
    const response = await this.httpClient.request<TModel>(`/${resource}`, {
      method: 'POST',
      body: params.data,
      params: params.meta,
    })

    return response
  }

  async update<TModel extends BaseModel = BaseModel>(
    resource: string,
    params: UpdateParams<TModel>
  ): Promise<TModel> {
    const response = await this.httpClient.request<TModel>(
      `/${resource}/${params.id}`,
      {
        method: 'PUT',
        body: params.data,
        params: params.meta,
      }
    )

    return response
  }

  async delete(resource: string, params: DeleteParams): Promise<void> {
    await this.httpClient.request<void>(`/${resource}/${params.id}`, {
      method: 'DELETE',
      params: params.meta,
    })
  }

  async deleteMany(resource: string, params: DeleteManyParams): Promise<void> {
    await this.httpClient.request<void>(`/${resource}/batch`, {
      method: 'DELETE',
      body: { ids: params.ids },
      params: params.meta,
    })
  }

  async updateMany<TModel extends BaseModel = BaseModel>(
    resource: string,
    params: UpdateManyParams<TModel>
  ): Promise<TModel[]> {
    const response = await this.httpClient.request<TModel[]>(
      `/${resource}/batch`,
      {
        method: 'PUT',
        body: {
          ids: params.ids,
          data: params.data,
        },
        params: params.meta,
      }
    )

    return response
  }

  async custom<TResult = unknown, TPayload = unknown>(
    resource: string,
    method: string,
    payload?: TPayload
  ): Promise<TResult> {
    const response = await this.httpClient.request<TResult>(
      `/${resource}/${method}`,
      {
        method: 'POST',
        body: payload,
      }
    )

    return response
  }
}

/**
 * Create a REST data provider
 */
export function createRestDataProvider(
  config: RestDataProviderConfig
): DataProvider {
  return new RestDataProvider(config)
}
