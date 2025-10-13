/**
 * GraphQL Data Provider
 * Implementation of DataProvider for GraphQL APIs
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
  Sort,
  Filter,
  FilterOperator,
} from './types'
import { DataProviderError } from './types'
import type { BaseModel } from '../types'

/**
 * GraphQL operation types
 */
export type GraphQLOperationType = 'query' | 'mutation' | 'subscription'

/**
 * GraphQL variable
 */
export interface GraphQLVariable {
  name: string
  type: string
  value: unknown
}

/**
 * GraphQL query builder function
 */
export type QueryBuilder<TModel extends BaseModel = BaseModel> = (params: {
  resource: string
  fields?: string[]
  variables?: GraphQLVariable[]
  params?: GetListParams
}) => string

/**
 * GraphQL mutation builder function
 */
export type MutationBuilder<TModel extends BaseModel = BaseModel> = (params: {
  resource: string
  operation: 'create' | 'update' | 'delete' | 'deleteMany' | 'updateMany'
  fields?: string[]
  variables?: GraphQLVariable[]
  data?: unknown
}) => string

/**
 * GraphQL Data Provider configuration
 */
export interface GraphQLDataProviderConfig {
  /** GraphQL endpoint URL */
  endpoint: string

  /** Default headers */
  headers?: Record<string, string>

  /** Custom fetch implementation */
  fetchFn?: typeof fetch

  /** Resource field mappings */
  fieldMappings?: {
    id?: string
    data?: string
    total?: string
    pageInfo?: string
  }

  /** Query builders */
  queries?: {
    getList?: QueryBuilder
    getOne?: QueryBuilder
  }

  /** Mutation builders */
  mutations?: {
    create?: MutationBuilder
    update?: MutationBuilder
    delete?: MutationBuilder
    deleteMany?: MutationBuilder
    updateMany?: MutationBuilder
  }

  /** Operation name prefix */
  operationPrefix?: string

  /** Include __typename in queries */
  includeTypename?: boolean

  /** Transform GraphQL errors */
  transformError?: (error: unknown) => DataProviderError
}

/**
 * GraphQL client for making requests
 */
class GraphQLClient {
  private endpoint: string
  private headers: Record<string, string>
  private fetchFn: typeof fetch

  constructor(
    endpoint: string,
    headers: Record<string, string> = {},
    fetchFn: typeof fetch = fetch
  ) {
    this.endpoint = endpoint
    this.headers = headers
    this.fetchFn = fetchFn
  }

  async request<TResult = unknown>(
    query: string,
    variables?: Record<string, unknown>
  ): Promise<TResult> {
    try {
      const response = await this.fetchFn(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.headers,
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        throw new DataProviderError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorBody
        )
      }

      const result = await response.json()

      if (result.errors && result.errors.length > 0) {
        const errorMessage = result.errors.map((e: any) => e.message).join(', ')
        throw new DataProviderError(`GraphQL Error: ${errorMessage}`, undefined, result.errors)
      }

      return result.data as TResult
    } catch (error) {
      if (error instanceof DataProviderError) {
        throw error
      }
      throw new DataProviderError(
        error instanceof Error ? error.message : 'Unknown GraphQL error occurred'
      )
    }
  }
}

/**
 * Build filter arguments for GraphQL
 */
function buildFilterArgs(filters: Filter | Filter[]): Record<string, unknown> {
  const filterArray = Array.isArray(filters) ? filters : [filters]
  const args: Record<string, unknown> = {}

  filterArray.forEach((filter) => {
    const { field, operator, value } = filter

    switch (operator) {
      case 'eq':
        args[field] = value
        break
      case 'ne':
        args[`${field}_not`] = value
        break
      case 'lt':
        args[`${field}_lt`] = value
        break
      case 'lte':
        args[`${field}_lte`] = value
        break
      case 'gt':
        args[`${field}_gt`] = value
        break
      case 'gte':
        args[`${field}_gte`] = value
        break
      case 'in':
        args[`${field}_in`] = value
        break
      case 'nin':
        args[`${field}_not_in`] = value
        break
      case 'contains':
        args[`${field}_contains`] = value
        break
      case 'startsWith':
        args[`${field}_starts_with`] = value
        break
      case 'endsWith':
        args[`${field}_ends_with`] = value
        break
      case 'null':
        args[field] = null
        break
      case 'notNull':
        args[`${field}_not`] = null
        break
    }
  })

  return args
}

/**
 * Build sort arguments for GraphQL
 */
function buildSortArgs(sort: Sort | Sort[]): Record<string, unknown> {
  const sortArray = Array.isArray(sort) ? sort : [sort]

  if (sortArray.length === 0) return {}

  // Most GraphQL APIs use orderBy with format like: [{ field: "ASC" }]
  return {
    orderBy: sortArray.map((s) => ({
      [s.field]: s.order.toUpperCase(),
    })),
  }
}

/**
 * Default query builder for getList
 */
function defaultGetListQuery<TModel extends BaseModel = BaseModel>(params: {
  resource: string
  fields?: string[]
  variables?: GraphQLVariable[]
  params?: GetListParams
}): string {
  const { resource, fields = ['id'], params: queryParams } = params
  const resourcePlural = `${resource}s` // Simple pluralization

  const args: string[] = []
  const variables: string[] = []

  // Pagination
  if (queryParams?.pagination) {
    if (queryParams.pagination.page && queryParams.pagination.perPage) {
      variables.push('$page: Int', '$perPage: Int')
      args.push('page: $page', 'perPage: $perPage')
    }
    if (queryParams.pagination.cursor) {
      variables.push('$cursor: String')
      args.push('cursor: $cursor')
    }
  }

  // Sort
  if (queryParams?.sort) {
    variables.push('$orderBy: [OrderByInput!]')
    args.push('orderBy: $orderBy')
  }

  // Filter
  if (queryParams?.filter) {
    variables.push('$where: WhereInput')
    args.push('where: $where')
  }

  // Search
  if (queryParams?.search) {
    variables.push('$search: String')
    args.push('search: $search')
  }

  const varDeclaration = variables.length > 0 ? `(${variables.join(', ')})` : ''
  const argDeclaration = args.length > 0 ? `(${args.join(', ')})` : ''
  const fieldList = fields.join('\n      ')

  return `
    query GetList${varDeclaration} {
      ${resourcePlural}${argDeclaration} {
        data {
          ${fieldList}
        }
        total
        pageInfo {
          page
          perPage
          pageCount
        }
      }
    }
  `.trim()
}

/**
 * Default query builder for getOne
 */
function defaultGetOneQuery<TModel extends BaseModel = BaseModel>(params: {
  resource: string
  fields?: string[]
}): string {
  const { resource, fields = ['id'] } = params
  const fieldList = fields.join('\n      ')

  return `
    query GetOne($id: ID!) {
      ${resource}(id: $id) {
        ${fieldList}
      }
    }
  `.trim()
}

/**
 * Default mutation builder for create
 */
function defaultCreateMutation<TModel extends BaseModel = BaseModel>(params: {
  resource: string
  fields?: string[]
}): string {
  const { resource, fields = ['id'] } = params
  const operationName = `create${resource.charAt(0).toUpperCase() + resource.slice(1)}`
  const fieldList = fields.join('\n      ')

  return `
    mutation Create($data: ${resource.charAt(0).toUpperCase() + resource.slice(1)}Input!) {
      ${operationName}(data: $data) {
        ${fieldList}
      }
    }
  `.trim()
}

/**
 * Default mutation builder for update
 */
function defaultUpdateMutation<TModel extends BaseModel = BaseModel>(params: {
  resource: string
  fields?: string[]
}): string {
  const { resource, fields = ['id'] } = params
  const operationName = `update${resource.charAt(0).toUpperCase() + resource.slice(1)}`
  const fieldList = fields.join('\n      ')

  return `
    mutation Update($id: ID!, $data: ${resource.charAt(0).toUpperCase() + resource.slice(1)}Input!) {
      ${operationName}(id: $id, data: $data) {
        ${fieldList}
      }
    }
  `.trim()
}

/**
 * Default mutation builder for delete
 */
function defaultDeleteMutation(params: { resource: string }): string {
  const { resource } = params
  const operationName = `delete${resource.charAt(0).toUpperCase() + resource.slice(1)}`

  return `
    mutation Delete($id: ID!) {
      ${operationName}(id: $id)
    }
  `.trim()
}

/**
 * GraphQL Data Provider
 */
export class GraphQLDataProvider implements DataProvider {
  private client: GraphQLClient
  private config: Required<GraphQLDataProviderConfig>

  constructor(config: GraphQLDataProviderConfig) {
    this.config = {
      endpoint: config.endpoint,
      headers: config.headers || {},
      fetchFn: config.fetchFn || fetch,
      fieldMappings: {
        id: config.fieldMappings?.id || 'id',
        data: config.fieldMappings?.data || 'data',
        total: config.fieldMappings?.total || 'total',
        pageInfo: config.fieldMappings?.pageInfo || 'pageInfo',
      },
      queries: {
        getList: config.queries?.getList || defaultGetListQuery,
        getOne: config.queries?.getOne || defaultGetOneQuery,
      },
      mutations: {
        create: config.mutations?.create || defaultCreateMutation,
        update: config.mutations?.update || defaultUpdateMutation,
        delete: config.mutations?.delete || defaultDeleteMutation,
        deleteMany: config.mutations?.deleteMany,
        updateMany: config.mutations?.updateMany,
      },
      operationPrefix: config.operationPrefix || '',
      includeTypename: config.includeTypename ?? false,
      transformError: config.transformError || ((error) => error as DataProviderError),
    }

    this.client = new GraphQLClient(
      this.config.endpoint,
      this.config.headers,
      this.config.fetchFn
    )
  }

  async getList<TModel extends BaseModel = BaseModel>(
    resource: string,
    params: GetListParams
  ): Promise<GetListResult<TModel>> {
    try {
      const query = this.config.queries.getList!({
        resource,
        params,
      })

      const variables: Record<string, unknown> = {}

      // Build variables
      if (params.pagination) {
        if (params.pagination.page) variables.page = params.pagination.page
        if (params.pagination.perPage) variables.perPage = params.pagination.perPage
        if (params.pagination.cursor) variables.cursor = params.pagination.cursor
      }

      if (params.sort) {
        variables.orderBy = buildSortArgs(params.sort).orderBy
      }

      if (params.filter) {
        variables.where = buildFilterArgs(params.filter)
      }

      if (params.search) {
        variables.search = params.search
      }

      const response = await this.client.request<any>(query, variables)

      const resourcePlural = `${resource}s`
      const result = response[resourcePlural]

      return {
        data: result[this.config.fieldMappings.data] || result.data || [],
        total: result[this.config.fieldMappings.total] || result.total || 0,
        page: result[this.config.fieldMappings.pageInfo]?.page,
        perPage: result[this.config.fieldMappings.pageInfo]?.perPage,
        pageCount: result[this.config.fieldMappings.pageInfo]?.pageCount,
      }
    } catch (error) {
      throw this.config.transformError(error)
    }
  }

  async getOne<TModel extends BaseModel = BaseModel>(
    resource: string,
    id: string | number,
    params?: GetOneParams
  ): Promise<TModel> {
    try {
      const query = this.config.queries.getOne!({ resource })
      const response = await this.client.request<any>(query, { id })

      return response[resource] as TModel
    } catch (error) {
      throw this.config.transformError(error)
    }
  }

  async create<TModel extends BaseModel = BaseModel>(
    resource: string,
    params: CreateParams<TModel>
  ): Promise<TModel> {
    try {
      const mutation = this.config.mutations.create!({ resource })
      const operationName = `create${resource.charAt(0).toUpperCase() + resource.slice(1)}`

      const response = await this.client.request<any>(mutation, { data: params.data })

      return response[operationName] as TModel
    } catch (error) {
      throw this.config.transformError(error)
    }
  }

  async update<TModel extends BaseModel = BaseModel>(
    resource: string,
    params: UpdateParams<TModel>
  ): Promise<TModel> {
    try {
      const mutation = this.config.mutations.update!({ resource })
      const operationName = `update${resource.charAt(0).toUpperCase() + resource.slice(1)}`

      const response = await this.client.request<any>(mutation, {
        id: params.id,
        data: params.data,
      })

      return response[operationName] as TModel
    } catch (error) {
      throw this.config.transformError(error)
    }
  }

  async delete(resource: string, params: DeleteParams): Promise<void> {
    try {
      const mutation = this.config.mutations.delete!({ resource })
      await this.client.request<any>(mutation, { id: params.id })
    } catch (error) {
      throw this.config.transformError(error)
    }
  }

  async deleteMany(resource: string, params: DeleteManyParams): Promise<void> {
    if (!this.config.mutations.deleteMany) {
      // Fallback to individual deletes
      await Promise.all(
        params.ids.map((id) => this.delete(resource, { id }))
      )
      return
    }

    try {
      const mutation = this.config.mutations.deleteMany({ resource, operation: 'deleteMany' })
      await this.client.request<any>(mutation, { ids: params.ids })
    } catch (error) {
      throw this.config.transformError(error)
    }
  }

  async updateMany<TModel extends BaseModel = BaseModel>(
    resource: string,
    params: UpdateManyParams<TModel>
  ): Promise<TModel[]> {
    if (!this.config.mutations.updateMany) {
      // Fallback to individual updates
      const results = await Promise.all(
        params.ids.map((id) =>
          this.update(resource, { id, data: params.data })
        )
      )
      return results
    }

    try {
      const mutation = this.config.mutations.updateMany({ resource, operation: 'updateMany' })
      const operationName = `update${resource.charAt(0).toUpperCase() + resource.slice(1)}Many`

      const response = await this.client.request<any>(mutation, {
        ids: params.ids,
        data: params.data,
      })

      return response[operationName] as TModel[]
    } catch (error) {
      throw this.config.transformError(error)
    }
  }

  async custom<TResult = unknown, TPayload = unknown>(
    resource: string,
    method: string,
    payload?: TPayload
  ): Promise<TResult> {
    // For custom operations, you would typically pass a custom query/mutation
    // This is a basic implementation
    throw new Error('Custom operations require custom query/mutation builders')
  }
}

/**
 * Create a GraphQL data provider
 */
export function createGraphQLDataProvider(
  config: GraphQLDataProviderConfig
): DataProvider {
  return new GraphQLDataProvider(config)
}
