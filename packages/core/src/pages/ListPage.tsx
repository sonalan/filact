/**
 * List Page Component
 * Auto-generated CRUD list page with table, filters, and actions
 */

import { useState } from 'react'
import type { BaseModel } from '../types/resource'
import type { ResourceConfig } from '../resources/builder'
import type { GetListParams } from '../providers/types'
import { useResourceList } from '../hooks/useResource'

export interface ListPageProps<TModel extends BaseModel> {
  /** Resource configuration */
  config: ResourceConfig<TModel>

  /** Initial pagination params */
  initialPage?: number
  initialPerPage?: number

  /** Custom header actions */
  headerActions?: React.ReactNode

  /** Custom empty state */
  emptyState?: React.ReactNode

  /** Loading state component */
  loadingState?: React.ReactNode
}

/**
 * List Page Component
 * Displays a paginated, filterable table of records
 */
export function ListPage<TModel extends BaseModel>({
  config,
  initialPage = 1,
  initialPerPage = 10,
  headerActions,
  emptyState,
  loadingState,
}: ListPageProps<TModel>) {
  const [params, setParams] = useState<GetListParams>({
    pagination: {
      page: initialPage,
      perPage: initialPerPage,
    },
  })

  const { data, isLoading, isError, error } = useResourceList(config, params)

  const handlePageChange = (page: number) => {
    setParams(prev => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        page,
      },
    }))
  }

  const handlePerPageChange = (perPage: number) => {
    setParams(prev => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        perPage,
        page: 1, // Reset to first page
      },
    }))
  }

  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    setParams(prev => ({
      ...prev,
      sort: { field, order },
    }))
  }

  const handleFilterChange = (filters: Record<string, unknown>) => {
    setParams(prev => ({
      ...prev,
      filter: filters,
      pagination: {
        ...prev.pagination,
        page: 1, // Reset to first page when filtering
      },
    }))
  }

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        {loadingState || <div>Loading...</div>}
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-red-500">
        <div>
          <h3 className="text-lg font-semibold mb-2">Error loading {config.model.name}</h3>
          <p className="text-sm">{error?.message || 'An error occurred'}</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (!data || data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        {emptyState || (
          <div className="text-center text-gray-500">
            <p className="text-lg mb-2">No {config.model.name} found</p>
            <p className="text-sm">Get started by creating a new record</p>
          </div>
        )}
      </div>
    )
  }

  const { data: records, total } = data
  const currentPage = params.pagination?.page || 1
  const perPage = params.pagination?.perPage || 10
  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{config.model.name}</h1>
          <p className="text-sm text-gray-500">
            {total} {total === 1 ? 'record' : 'records'}
          </p>
        </div>
        {headerActions && <div className="flex gap-2">{headerActions}</div>}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {config.table?.columns.map((column) => (
                <th
                  key={String(column.name)}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-700"
                >
                  {column.label}
                </th>
              ))}
              {config.rowActions && config.rowActions.length > 0 && (
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {records.map((record) => (
              <tr key={String(record[config.model.primaryKey || 'id'])} className="hover:bg-gray-50">
                {config.table?.columns.map((column) => (
                  <td
                    key={String(column.name)}
                    className="px-4 py-3 text-sm text-gray-900"
                  >
                    {String(record[column.name as keyof TModel] ?? '')}
                  </td>
                ))}
                {config.rowActions && config.rowActions.length > 0 && (
                  <td className="px-4 py-3 text-right text-sm">
                    <div className="flex justify-end gap-2">
                      {config.rowActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => action.handler?.(record)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {(currentPage - 1) * perPage + 1} to{' '}
          {Math.min(currentPage * perPage, total)} of {total} results
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 border rounded ${
                  page === currentPage
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
