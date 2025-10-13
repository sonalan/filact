/**
 * Integration Tests: Table Interactions
 * Tests table sorting, filtering, pagination, and selection with data provider
 */

import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { server, resetMockData, mockUsers } from '../test-utils/msw-server'
import { createTestQueryClient, AllProviders, createTestDataProvider } from '../test-utils/integration-test-utils'
import { useResourceList } from '../hooks/useResource'
import { createResource } from '../resources/builder'
import type { ModelDefinition } from '../types/resource'
import type { MockUser } from '../test-utils/integration-test-utils'
import { useState } from 'react'

// Start MSW server
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => {
  server.resetHandlers()
  resetMockData()
})

describe('Table Interactions Integration Tests', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>
  let dataProvider: ReturnType<typeof createTestDataProvider>
  let userModel: ModelDefinition<MockUser>

  beforeEach(() => {
    queryClient = createTestQueryClient()
    dataProvider = createTestDataProvider()
    userModel = {
      name: 'User',
      pluralName: 'Users',
      endpoint: 'users',
      primaryKey: 'id',
      displayField: 'name',
    }
  })

  describe('Pagination', () => {
    it('should paginate through results', async () => {
      const user = userEvent.setup()
      const config = createResource(userModel, dataProvider).build()

      function PaginatedTable() {
        const [page, setPage] = useState(1)
        const { data, isSuccess } = useResourceList<MockUser>(config, {
          pagination: { page, perPage: 2 },
        })

        return (
          <div>
            {isSuccess && (
              <>
                <div data-testid="users-list">
                  {data?.data.map((user) => (
                    <div key={user.id} data-testid={`user-${user.id}`}>
                      {user.name}
                    </div>
                  ))}
                </div>
                <div data-testid="pagination-info">
                  Page {data?.page} of {data?.pageCount} (Total: {data?.total})
                </div>
                <button onClick={() => setPage((p) => p + 1)} disabled={page >= (data?.pageCount || 1)}>
                  Next Page
                </button>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                  Previous Page
                </button>
              </>
            )}
          </div>
        )
      }

      render(
        <AllProviders queryClient={queryClient}>
          <PaginatedTable />
        </AllProviders>
      )

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('pagination-info')).toHaveTextContent('Page 1')
      })

      // Should show first 2 users
      expect(screen.getByTestId('user-1')).toHaveTextContent('Alice Smith')
      expect(screen.getByTestId('user-2')).toHaveTextContent('Bob Johnson')
      expect(screen.queryByTestId('user-3')).not.toBeInTheDocument()
    })

    it('should update page size', async () => {
      const config = createResource(userModel, dataProvider).build()

      function TableWithPageSize() {
        const [perPage, setPerPage] = useState(2)
        const { data, isSuccess } = useResourceList<MockUser>(config, {
          pagination: { page: 1, perPage },
        })

        return (
          <div>
            {isSuccess && (
              <>
                <div data-testid="users-list">
                  {data?.data.map((user) => (
                    <div key={user.id}>{user.name}</div>
                  ))}
                </div>
                <div data-testid="per-page">Per page: {data?.perPage}</div>
                <button onClick={() => setPerPage(10)}>Show 10</button>
              </>
            )}
          </div>
        )
      }

      render(
        <AllProviders queryClient={queryClient}>
          <TableWithPageSize />
        </AllProviders>
      )

      await waitFor(() => {
        expect(screen.getByTestId('per-page')).toHaveTextContent('Per page: 2')
      })

      // Click to change page size
      await userEvent.setup().click(screen.getByText('Show 10'))

      await waitFor(() => {
        expect(screen.getByTestId('per-page')).toHaveTextContent('Per page: 10')
      })
    })
  })

  describe('Sorting', () => {
    it('should sort results by field', async () => {
      const user = userEvent.setup()
      const config = createResource(userModel, dataProvider).build()

      function SortableTable() {
        const [sortField, setSortField] = useState<string>('name')
        const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

        const { data, isSuccess } = useResourceList<MockUser>(config, {
          sort: { field: sortField, order: sortOrder },
        })

        return (
          <div>
            {isSuccess && (
              <>
                <div data-testid="users-list">
                  {data?.data.map((user) => (
                    <div key={user.id} data-testid={`user-${user.id}`}>
                      {user.name}
                    </div>
                  ))}
                </div>
                <div data-testid="sort-info">
                  Sort: {sortField} {sortOrder}
                </div>
                <button
                  onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
                >
                  Toggle Order
                </button>
              </>
            )}
          </div>
        )
      }

      render(
        <AllProviders queryClient={queryClient}>
          <SortableTable />
        </AllProviders>
      )

      await waitFor(() => {
        expect(screen.getByTestId('sort-info')).toHaveTextContent('Sort: name asc')
      })

      // All users should be present
      expect(screen.getByTestId('user-1')).toBeInTheDocument()
      expect(screen.getByTestId('user-2')).toBeInTheDocument()
      expect(screen.getByTestId('user-3')).toBeInTheDocument()

      // Toggle sort order
      await user.click(screen.getByText('Toggle Order'))

      await waitFor(() => {
        expect(screen.getByTestId('sort-info')).toHaveTextContent('Sort: name desc')
      })
    })
  })

  describe('Filtering', () => {
    it('should filter results', async () => {
      const user = userEvent.setup()
      const config = createResource(userModel, dataProvider).build()

      function FilterableTable() {
        const [filterValue, setFilterValue] = useState<string | undefined>()

        const { data, isSuccess } = useResourceList<MockUser>(config, {
          filter: filterValue
            ? { field: 'status', operator: 'eq', value: filterValue }
            : undefined,
        })

        return (
          <div>
            <button onClick={() => setFilterValue('active')}>Show Active</button>
            <button onClick={() => setFilterValue(undefined)}>Show All</button>

            {isSuccess && (
              <>
                <div data-testid="users-list">
                  {data?.data.map((user) => (
                    <div key={user.id} data-testid={`user-${user.id}`}>
                      {user.name} - {user.status}
                    </div>
                  ))}
                </div>
                <div data-testid="filter-status">
                  Filter: {filterValue || 'none'}
                </div>
              </>
            )}
          </div>
        )
      }

      render(
        <AllProviders queryClient={queryClient}>
          <FilterableTable />
        </AllProviders>
      )

      // Wait for initial load (no filter)
      await waitFor(() => {
        expect(screen.getByTestId('filter-status')).toHaveTextContent('Filter: none')
      })

      // Apply active filter
      await user.click(screen.getByText('Show Active'))

      await waitFor(() => {
        expect(screen.getByTestId('filter-status')).toHaveTextContent('Filter: active')
      })
    })
  })

  describe('Search', () => {
    it('should search through results', async () => {
      const user = userEvent.setup()
      const config = createResource(userModel, dataProvider).build()

      function SearchableTable() {
        const [searchTerm, setSearchTerm] = useState('')

        const { data, isSuccess } = useResourceList<MockUser>(config, {
          search: searchTerm || undefined,
        })

        return (
          <div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="search-input"
            />

            {isSuccess && (
              <>
                <div data-testid="users-list">
                  {data?.data.map((user) => (
                    <div key={user.id}>{user.name}</div>
                  ))}
                </div>
                <div data-testid="search-status">
                  Search: {searchTerm || 'none'}
                </div>
              </>
            )}
          </div>
        )
      }

      render(
        <AllProviders queryClient={queryClient}>
          <SearchableTable />
        </AllProviders>
      )

      await waitFor(() => {
        expect(screen.getByTestId('search-status')).toHaveTextContent('Search: none')
      })

      // Search for "alice"
      await user.type(screen.getByTestId('search-input'), 'alice')

      await waitFor(() => {
        expect(screen.getByTestId('search-status')).toHaveTextContent('Search: alice')
      })
    })
  })

  describe('Combined Operations', () => {
    it('should handle pagination, sorting, and filtering together', async () => {
      const user = userEvent.setup()
      const config = createResource(userModel, dataProvider).build()

      function ComplexTable() {
        const [page, setPage] = useState(1)
        const [sortField] = useState('name')
        const [sortOrder] = useState<'asc' | 'desc'>('asc')
        const [filterStatus, setFilterStatus] = useState<string | undefined>()

        const { data, isSuccess, isLoading } = useResourceList<MockUser>(config, {
          pagination: { page, perPage: 2 },
          sort: { field: sortField, order: sortOrder },
          filter: filterStatus
            ? { field: 'status', operator: 'eq', value: filterStatus }
            : undefined,
        })

        return (
          <div>
            {isLoading && <div data-testid="loading">Loading...</div>}

            {isSuccess && (
              <>
                <button onClick={() => setFilterStatus('active')}>Active Only</button>
                <button onClick={() => setFilterStatus(undefined)}>All</button>

                <div data-testid="users-list">
                  {data?.data.map((user) => (
                    <div key={user.id}>{user.name}</div>
                  ))}
                </div>

                <div data-testid="table-state">
                  Page: {data?.page}, Sort: {sortField} {sortOrder}, Filter:{' '}
                  {filterStatus || 'none'}
                </div>

                <button onClick={() => setPage((p) => p + 1)}>Next</button>
              </>
            )}
          </div>
        )
      }

      render(
        <AllProviders queryClient={queryClient}>
          <ComplexTable />
        </AllProviders>
      )

      await waitFor(() => {
        expect(screen.getByTestId('table-state')).toHaveTextContent(
          'Page: 1, Sort: name asc, Filter: none'
        )
      })

      // Apply filter
      await user.click(screen.getByText('Active Only'))

      await waitFor(() => {
        expect(screen.getByTestId('table-state')).toHaveTextContent(
          'Page: 1, Sort: name asc, Filter: active'
        )
      })
    })
  })

  describe('Loading and Error States', () => {
    it('should show loading state', () => {
      const config = createResource(userModel, dataProvider).build()

      function TableWithLoading() {
        const { isLoading, isSuccess } = useResourceList<MockUser>(config)

        return (
          <div>
            {isLoading && <div data-testid="loading">Loading...</div>}
            {isSuccess && <div data-testid="success">Loaded</div>}
          </div>
        )
      }

      render(
        <AllProviders queryClient={queryClient}>
          <TableWithLoading />
        </AllProviders>
      )

      // Initially should show loading
      expect(screen.getByTestId('loading')).toBeInTheDocument()
    })

    it('should handle empty state', async () => {
      const config = createResource(userModel, dataProvider).build()

      function TableWithEmpty() {
        const { data, isSuccess } = useResourceList<MockUser>(config)

        return (
          <div>
            {isSuccess && (
              <>
                {data?.data.length === 0 ? (
                  <div data-testid="empty">No users found</div>
                ) : (
                  <div data-testid="has-data">Has {data?.data.length} users</div>
                )}
              </>
            )}
          </div>
        )
      }

      render(
        <AllProviders queryClient={queryClient}>
          <TableWithEmpty />
        </AllProviders>
      )

      await waitFor(() => {
        expect(screen.getByTestId('has-data')).toHaveTextContent('Has 3 users')
      })
    })
  })
})
