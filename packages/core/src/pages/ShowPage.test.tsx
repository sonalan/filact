import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ShowPage } from './ShowPage'
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
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BrowserRouter>
  )
}

describe('ShowPage', () => {
  let mockProvider: DataProvider
  let resourceConfig: ResourceConfig<TestModel>

  beforeEach(() => {
    mockProvider = {
      getList: vi.fn(),
      getOne: vi.fn().mockResolvedValue({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        active: true,
      }),
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
      form: {
        fields: [
          { name: 'name', label: 'Name', type: 'text' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'active', label: 'Active', type: 'checkbox' },
        ],
      },
    }
  })

  it('should render record details', async () => {
    render(<ShowPage config={resourceConfig} id={1} />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('User Details')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })
  })

  it('should display loading state', () => {
    mockProvider.getOne = vi.fn(() => new Promise(() => {})) // Never resolves

    render(<ShowPage config={resourceConfig} id={1} />, { wrapper: createWrapper() })

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should display error state if record not found', async () => {
    mockProvider.getOne = vi.fn().mockRejectedValue(new Error('Not found'))

    render(<ShowPage config={resourceConfig} id={1} />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Error loading User')).toBeInTheDocument()
      expect(screen.getByText('Not found')).toBeInTheDocument()
    })
  })

  it('should render custom details', async () => {
    const renderDetails = vi.fn(() => <div>Custom Details View</div>)

    render(
      <ShowPage config={resourceConfig} id={1} renderDetails={renderDetails} />,
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(screen.getByText('Custom Details View')).toBeInTheDocument()
      expect(renderDetails).toHaveBeenCalledWith({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        active: true,
      })
    })
  })

  it('should render custom actions', async () => {
    render(
      <ShowPage
        config={resourceConfig}
        id={1}
        actions={<button>Edit User</button>}
      />,
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(screen.getByText('Edit User')).toBeInTheDocument()
    })
  })

  it('should display checkbox fields with badges', async () => {
    render(<ShowPage config={resourceConfig} id={1} />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Yes')).toBeInTheDocument()
    })
  })

  it('should display No badge for false checkbox', async () => {
    mockProvider.getOne = vi.fn().mockResolvedValue({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      active: false,
    })

    render(<ShowPage config={resourceConfig} id={1} />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('No')).toBeInTheDocument()
    })
  })

  it('should show all record properties when no form schema', async () => {
    const configWithoutForm: ResourceConfig<TestModel> = {
      ...resourceConfig,
      form: undefined,
    }

    render(<ShowPage config={configWithoutForm} id={1} />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(screen.getByText('Id')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
    })
  })

  it('should display select field labels when available', async () => {
    const configWithSelect: ResourceConfig<TestModel & { status: string }> = {
      model: {
        name: 'User',
        endpoint: '/users',
        primaryKey: 'id',
      },
      provider: {
        ...mockProvider,
        getOne: vi.fn().mockResolvedValue({
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          active: true,
          status: 'active',
        }),
      },
      form: {
        fields: [
          { name: 'name', label: 'Name', type: 'text' },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ],
          },
        ],
      },
    }

    render(<ShowPage config={configWithSelect} id={1} />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
    })
  })

  it('should have back to list button', async () => {
    render(<ShowPage config={resourceConfig} id={1} />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Back to List')).toBeInTheDocument()
    })
  })

  it('should display hyphen for null/undefined values', async () => {
    mockProvider.getOne = vi.fn().mockResolvedValue({
      id: 1,
      name: null,
      email: undefined,
      active: true,
    })

    render(<ShowPage config={resourceConfig} id={1} />, { wrapper: createWrapper() })

    await waitFor(() => {
      const hyphens = screen.getAllByText('-')
      expect(hyphens.length).toBeGreaterThan(0)
    })
  })

  it('should get id from route params', async () => {
    // Mock useParams to return id
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom')
      return {
        ...actual,
        useParams: () => ({ id: '1' }),
      }
    })

    render(<ShowPage config={resourceConfig} />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(mockProvider.getOne).toHaveBeenCalledWith('/users', { id: '1' })
    })
  })
})
