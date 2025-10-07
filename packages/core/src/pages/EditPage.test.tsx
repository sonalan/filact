import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { EditPage } from './EditPage'
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

describe('EditPage', () => {
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
      update: vi.fn().mockImplementation((_, { data }) =>
        Promise.resolve({ id: 1, ...data })
      ),
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
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'active', label: 'Active', type: 'checkbox' },
        ],
      },
    }
  })

  it('should render edit form with prefilled data', async () => {
    render(<EditPage config={resourceConfig} id={1} />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByLabelText(/Name/)).toHaveValue('John Doe')
      expect(screen.getByLabelText(/Email/)).toHaveValue('john@example.com')
      expect(screen.getByLabelText(/Active/)).toBeChecked()
    })
  })

  it('should display loading state', () => {
    mockProvider.getOne = vi.fn(() => new Promise(() => {})) // Never resolves

    render(<EditPage config={resourceConfig} id={1} />, { wrapper: createWrapper() })

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should display error state if record not found', async () => {
    mockProvider.getOne = vi.fn().mockRejectedValue(new Error('Not found'))

    render(<EditPage config={resourceConfig} id={1} />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Error loading User')).toBeInTheDocument()
      expect(screen.getByText('Not found')).toBeInTheDocument()
    })
  })

  it('should submit updated form data', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()

    render(<EditPage config={resourceConfig} id={1} onSuccess={onSuccess} />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(screen.getByLabelText(/Name/)).toHaveValue('John Doe')
    })

    const nameInput = screen.getByLabelText(/Name/)
    const submitButton = screen.getByText('Update')

    await user.clear(nameInput)
    await user.type(nameInput, 'Jane Doe')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockProvider.update).toHaveBeenCalledWith('/users', {
        id: 1,
        data: {
          name: 'Jane Doe',
          email: 'john@example.com',
          active: true, // Checkbox value
        },
      })
      expect(onSuccess).toHaveBeenCalledWith({
        id: 1,
        name: 'Jane Doe',
        email: 'john@example.com',
        active: true,
      })
    })
  })

  it('should display error on update failure', async () => {
    const user = userEvent.setup()
    mockProvider.update = vi.fn().mockRejectedValue(new Error('Update failed'))

    render(<EditPage config={resourceConfig} id={1} />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByLabelText(/Name/)).toHaveValue('John Doe')
    })

    const submitButton = screen.getByText('Update')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Error updating record')).toBeInTheDocument()
      expect(screen.getByText('Update failed')).toBeInTheDocument()
    })
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    render(<EditPage config={resourceConfig} id={1} onCancel={onCancel} />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(screen.getByLabelText(/Name/)).toHaveValue('John Doe')
    })

    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)

    expect(onCancel).toHaveBeenCalled()
  })

  it('should disable form during submission', async () => {
    const user = userEvent.setup()
    mockProvider.update = vi.fn(() => new Promise(() => {})) // Never resolves

    render(<EditPage config={resourceConfig} id={1} />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByLabelText(/Name/)).toHaveValue('John Doe')
    })

    const submitButton = screen.getByText('Update')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Updating...')).toBeInTheDocument()
    })
  })

  it('should render custom form', async () => {
    const renderForm = vi.fn(() => <div>Custom Edit Form</div>)

    render(<EditPage config={resourceConfig} id={1} renderForm={renderForm} />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(screen.getByText('Custom Edit Form')).toBeInTheDocument()
      expect(renderForm).toHaveBeenCalled()
    })
  })

  it('should get id from route params', async () => {
    function TestWrapper({ children }: { children: React.ReactNode }) {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      })
      return (
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <Routes>
              <Route path="/" element={children} />
            </Routes>
          </QueryClientProvider>
        </BrowserRouter>
      )
    }

    // Mock useParams to return id
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom')
      return {
        ...actual,
        useParams: () => ({ id: '1' }),
      }
    })

    render(<EditPage config={resourceConfig} />, { wrapper: TestWrapper })

    await waitFor(() => {
      expect(mockProvider.getOne).toHaveBeenCalledWith('/users', { id: '1' })
    })
  })

  it('should show message when no form schema is defined', async () => {
    const configWithoutForm: ResourceConfig<TestModel> = {
      ...resourceConfig,
      form: undefined,
    }

    render(<EditPage config={configWithoutForm} id={1} />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(screen.getByText('No form schema defined for this resource')).toBeInTheDocument()
    })
  })
})
