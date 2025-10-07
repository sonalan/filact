import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ResourceTable } from './ResourceTable'
import type { ResourceConfig } from '../resources/builder'
import type { DataProvider } from '../providers/types'

interface TestModel {
  id: number
  name: string
  email: string
  active: boolean
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

describe('ResourceTable', () => {
  let mockProvider: DataProvider
  let resourceConfig: ResourceConfig<TestModel>

  beforeEach(() => {
    mockProvider = {
      getList: vi.fn().mockResolvedValue({
        data: [
          { id: 1, name: 'User 1', email: 'user1@test.com', active: true },
          { id: 2, name: 'User 2', email: 'user2@test.com', active: false },
          { id: 3, name: 'User 3', email: 'user3@test.com', active: true },
        ],
        total: 3,
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
          { name: 'name', label: 'Name', type: 'text', sortable: true },
          { name: 'email', label: 'Email', type: 'text', sortable: true },
        ],
      },
    }
  })

  it('should render table with data', async () => {
    render(<ResourceTable config={resourceConfig} />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument()
      expect(screen.getByText('User 2')).toBeInTheDocument()
      expect(screen.getByText('User 3')).toBeInTheDocument()
    })
  })

  it('should display loading skeleton', () => {
    mockProvider.getList = vi.fn(() => new Promise(() => {})) // Never resolves

    const { container } = render(<ResourceTable config={resourceConfig} />, { wrapper: createWrapper() })

    // Check for skeleton elements with animation
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('should display error state with retry button', async () => {
    mockProvider.getList = vi.fn().mockRejectedValue(new Error('Failed to load'))

    render(<ResourceTable config={resourceConfig} />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Error loading User')).toBeInTheDocument()
      expect(screen.getByText('Failed to load')).toBeInTheDocument()
      expect(screen.getByText('Retry')).toBeInTheDocument()
    })
  })

  it('should retry loading on retry button click', async () => {
    const user = userEvent.setup()
    mockProvider.getList = vi.fn().mockRejectedValueOnce(new Error('Failed'))
      .mockResolvedValueOnce({
        data: [{ id: 1, name: 'User 1', email: 'user1@test.com', active: true }],
        total: 1,
      })

    render(<ResourceTable config={resourceConfig} />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeInTheDocument()
    })

    const retryButton = screen.getByText('Retry')
    await user.click(retryButton)

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument()
    })
  })

  it('should display empty state', async () => {
    mockProvider.getList = vi.fn().mockResolvedValue({
      data: [],
      total: 0,
    })

    render(<ResourceTable config={resourceConfig} />, { wrapper: createWrapper() })

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
      <ResourceTable
        config={resourceConfig}
        emptyState={<div>Custom empty message</div>}
      />,
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(screen.getByText('Custom empty message')).toBeInTheDocument()
    })
  })

  it('should handle pagination', async () => {
    const user = userEvent.setup()

    render(<ResourceTable config={resourceConfig} />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument()
    })

    // Check pagination info
    expect(screen.getByText(/Showing 1 to 3 of 3 results/)).toBeInTheDocument()

    // Check next/prev buttons exist
    expect(screen.getByText('Previous')).toBeDisabled()
    expect(screen.getByText('Next')).toBeDisabled() // Only 1 page
  })

  it('should change page size', async () => {
    const user = userEvent.setup()

    render(<ResourceTable config={resourceConfig} />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument()
    })

    const pageSizeSelect = screen.getByRole('combobox')
    await user.selectOptions(pageSizeSelect, '20')

    await waitFor(() => {
      expect(mockProvider.getList).toHaveBeenCalledWith('/users', {
        pagination: { page: 1, perPage: 20 },
      })
    })
  })

  it('should handle sorting', async () => {
    const user = userEvent.setup()

    render(<ResourceTable config={resourceConfig} />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument()
    })

    // Click on Name column header to sort
    const nameHeader = screen.getByText('Name').closest('div')
    if (nameHeader) {
      await user.click(nameHeader)
    }

    await waitFor(() => {
      expect(mockProvider.getList).toHaveBeenCalledWith('/users', {
        pagination: { page: 1, perPage: 10 },
        sort: { field: 'name', order: 'asc' },
      })
    })
  })

  it('should render row actions', async () => {
    const handleEdit = vi.fn()
    const handleDelete = vi.fn()

    const configWithActions: ResourceConfig<TestModel> = {
      ...resourceConfig,
      rowActions: [
        { label: 'Edit', handler: handleEdit },
        { label: 'Delete', handler: handleDelete },
      ],
    }

    render(<ResourceTable config={configWithActions} />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(screen.getAllByText('Edit')).toHaveLength(3)
      expect(screen.getAllByText('Delete')).toHaveLength(3)
    })
  })

  it('should call row action handler', async () => {
    const user = userEvent.setup()
    const handleEdit = vi.fn()

    const configWithActions: ResourceConfig<TestModel> = {
      ...resourceConfig,
      rowActions: [{ label: 'Edit', handler: handleEdit }],
    }

    render(<ResourceTable config={configWithActions} />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(screen.getAllByText('Edit')).toHaveLength(3)
    })

    const firstEditButton = screen.getAllByText('Edit')[0]
    await user.click(firstEditButton)

    expect(handleEdit).toHaveBeenCalledWith({
      id: 1,
      name: 'User 1',
      email: 'user1@test.com',
      active: true,
    })
  })

  it('should enable row selection', async () => {
    render(<ResourceTable config={resourceConfig} enableRowSelection />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Select all')).toBeInTheDocument()
      expect(screen.getByLabelText('Select row 1')).toBeInTheDocument()
    })
  })

  it('should handle row click', async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()

    render(<ResourceTable config={resourceConfig} onRowClick={onRowClick} />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument()
    })

    const firstRow = screen.getByText('User 1').closest('tr')
    if (firstRow) {
      await user.click(firstRow)
    }

    expect(onRowClick).toHaveBeenCalledWith({
      id: 1,
      name: 'User 1',
      email: 'user1@test.com',
      active: true,
    })
  })

  it('should use custom initial page and page size', async () => {
    render(<ResourceTable config={resourceConfig} initialPage={2} initialPageSize={20} />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(mockProvider.getList).toHaveBeenCalledWith('/users', {
        pagination: { page: 2, perPage: 20 },
      })
    })
  })

  it('should display sort indicators', async () => {
    render(<ResourceTable config={resourceConfig} />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument()
    })

    // Should show unsorted indicator for sortable columns
    // ID, Name, and Email columns have sortable enabled
    expect(screen.getAllByText('⇅').length).toBeGreaterThanOrEqual(2)
  })

  it('should not display actions column when no row actions', async () => {
    render(<ResourceTable config={resourceConfig} />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument()
    })

    expect(screen.queryByText('Actions')).not.toBeInTheDocument()
  })

  it('should display actions column when row actions exist', async () => {
    const configWithActions: ResourceConfig<TestModel> = {
      ...resourceConfig,
      rowActions: [{ label: 'Edit', handler: vi.fn() }],
    }

    render(<ResourceTable config={configWithActions} />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })
  })
})
