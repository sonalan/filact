import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ListPage } from './ListPage'
import type { ResourceConfig } from '../resources/builder'
import type { DataProvider } from '../providers/types'

interface TestModel {
  id: number
  name: string
  email: string
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('ListPage', () => {
  let mockProvider: DataProvider
  let resourceConfig: ResourceConfig<TestModel>

  beforeEach(() => {
    mockProvider = {
      getList: vi.fn().mockResolvedValue({
        data: [
          { id: 1, name: 'User 1', email: 'user1@test.com' },
          { id: 2, name: 'User 2', email: 'user2@test.com' },
        ],
        total: 2,
      }),
      getOne: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      updateMany: vi.fn(),
    }

    resourceConfig = {
      model: {
        name: 'User',
        endpoint: '/users',
        primaryKey: 'id',
      },
      provider: mockProvider,
      table: {
        columns: [
          { name: 'id', label: 'ID', type: 'text' },
          { name: 'name', label: 'Name', type: 'text' },
          { name: 'email', label: 'Email', type: 'text' },
        ],
      },
    }
  })

  it('should render list of records', async () => {
    render(<ListPage config={resourceConfig} />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument()
      expect(screen.getByText('User 2')).toBeInTheDocument()
    })

    expect(mockProvider.getList).toHaveBeenCalledWith('/users', {
      pagination: { page: 1, perPage: 10 },
    })
  })

  it('should display loading state', () => {
    mockProvider.getList = vi.fn(() => new Promise(() => {})) // Never resolves

    const { container } = render(<ListPage config={resourceConfig} />, { wrapper: createWrapper() })

    // Check for skeleton loading state
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('should display error state', async () => {
    mockProvider.getList = vi.fn().mockRejectedValue(new Error('Failed to load'))

    render(<ListPage config={resourceConfig} />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Error loading User')).toBeInTheDocument()
      expect(screen.getByText('Failed to load')).toBeInTheDocument()
    })
  })

  it('should display empty state', async () => {
    mockProvider.getList = vi.fn().mockResolvedValue({
      data: [],
      total: 0,
    })

    render(<ListPage config={resourceConfig} />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('No User found')).toBeInTheDocument()
    })
  })

  it('should display custom empty state', async () => {
    mockProvider.getList = vi.fn().mockResolvedValue({
      data: [],
      total: 0,
    })

    render(
      <ListPage
        config={resourceConfig}
        emptyState={<div>Custom empty message</div>}
      />,
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(screen.getByText('Custom empty message')).toBeInTheDocument()
    })
  })

  it('should display header actions', async () => {
    render(
      <ListPage
        config={resourceConfig}
        headerActions={<button>Create New</button>}
      />,
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(screen.getByText('Create New')).toBeInTheDocument()
    })
  })

  it('should display row actions', async () => {
    const handleEdit = vi.fn()
    const handleDelete = vi.fn()

    const configWithActions: ResourceConfig<TestModel> = {
      ...resourceConfig,
      rowActions: [
        { label: 'Edit', handler: handleEdit },
        { label: 'Delete', handler: handleDelete },
      ],
    }

    render(<ListPage config={configWithActions} />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getAllByText('Edit')).toHaveLength(2) // One for each row
      expect(screen.getAllByText('Delete')).toHaveLength(2)
    })
  })

  it('should display record count in pagination', async () => {
    render(<ListPage config={resourceConfig} />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText(/Showing 1 to 2 of 2 results/)).toBeInTheDocument()
    })
  })

  it('should display pagination info for single record', async () => {
    mockProvider.getList = vi.fn().mockResolvedValue({
      data: [{ id: 1, name: 'User 1', email: 'user1@test.com' }],
      total: 1,
    })

    render(<ListPage config={resourceConfig} />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText(/Showing 1 to 1 of 1 results/)).toBeInTheDocument()
    })
  })

  it('should use custom initial pagination', async () => {
    render(<ListPage config={resourceConfig} initialPage={2} initialPerPage={20} />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(mockProvider.getList).toHaveBeenCalledWith('/users', {
        pagination: { page: 2, perPage: 20 },
      })
    })
  })
})
