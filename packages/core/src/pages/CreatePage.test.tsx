import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { CreatePage } from './CreatePage'
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

describe('CreatePage', () => {
  let mockProvider: DataProvider
  let resourceConfig: ResourceConfig<TestModel>

  beforeEach(() => {
    mockProvider = {
      getList: vi.fn(),
      getOne: vi.fn(),
      create: vi.fn().mockImplementation((_, data) =>
        Promise.resolve({ id: 1, ...data })
      ),
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
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'active', label: 'Active', type: 'checkbox' },
        ],
      },
    }
  })

  it('should render create form', () => {
    render(<CreatePage config={resourceConfig} />, { wrapper: createWrapper() })

    expect(screen.getByText('Create User')).toBeInTheDocument()
    expect(screen.getByLabelText(/Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument()
  })

  it('should submit form data', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()

    render(<CreatePage config={resourceConfig} onSuccess={onSuccess} />, {
      wrapper: createWrapper(),
    })

    const nameInput = screen.getByLabelText(/Name/)
    const emailInput = screen.getByLabelText(/Email/)
    const submitButton = screen.getByText('Create')

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockProvider.create).toHaveBeenCalledWith('/users', {
        name: 'John Doe',
        email: 'john@example.com',
        active: false, // Checkbox was unchecked
      })
      expect(onSuccess).toHaveBeenCalledWith({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        active: false,
      })
    })
  })

  it('should display error on create failure', async () => {
    const user = userEvent.setup()
    mockProvider.create = vi.fn().mockRejectedValue(new Error('Create failed'))

    render(<CreatePage config={resourceConfig} />, { wrapper: createWrapper() })

    const nameInput = screen.getByLabelText(/Name/)
    const emailInput = screen.getByLabelText(/Email/)
    const submitButton = screen.getByText('Create')

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Error creating record')).toBeInTheDocument()
      expect(screen.getByText('Create failed')).toBeInTheDocument()
    })
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    render(<CreatePage config={resourceConfig} onCancel={onCancel} />, {
      wrapper: createWrapper(),
    })

    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)

    expect(onCancel).toHaveBeenCalled()
  })

  it('should disable form during submission', async () => {
    const user = userEvent.setup()
    mockProvider.create = vi.fn(() => new Promise(() => {})) // Never resolves

    render(<CreatePage config={resourceConfig} />, { wrapper: createWrapper() })

    const nameInput = screen.getByLabelText(/Name/)
    const emailInput = screen.getByLabelText(/Email/)
    const submitButton = screen.getByText('Create')

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Creating...')).toBeInTheDocument()
    })
  })

  it('should render custom form', () => {
    const renderForm = vi.fn(() => <div>Custom Form</div>)

    render(<CreatePage config={resourceConfig} renderForm={renderForm} />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Custom Form')).toBeInTheDocument()
    expect(renderForm).toHaveBeenCalled()
  })

  it('should show message when no form schema is defined', () => {
    const configWithoutForm: ResourceConfig<TestModel> = {
      ...resourceConfig,
      form: undefined,
    }

    render(<CreatePage config={configWithoutForm} />, { wrapper: createWrapper() })

    expect(screen.getByText('No form schema defined for this resource')).toBeInTheDocument()
  })
})
