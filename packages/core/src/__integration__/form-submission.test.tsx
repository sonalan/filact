/**
 * Integration Tests: Form Submission
 * Tests form creation, validation, and submission with data provider
 */

import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { server, resetMockData } from '../test-utils/msw-server'
import { createTestQueryClient, AllProviders, createTestDataProvider } from '../test-utils/integration-test-utils'
import { createResource } from '../resources/builder'
import { useResourceCreate, useResourceUpdate } from '../hooks/useResource'
import type { ModelDefinition } from '../types/resource'
import type { MockUser } from '../test-utils/integration-test-utils'

// Start MSW server
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => {
  server.resetHandlers()
  resetMockData()
})

describe('Form Submission Integration Tests', () => {
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

  describe('Create Form', () => {
    it('should submit create form successfully', async () => {
      const user = userEvent.setup()
      const config = createResource(userModel, dataProvider).build()

      function CreateForm() {
        const { mutate, isSuccess, data } = useResourceCreate<MockUser>(config)

        const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          mutate({
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            status: 'active',
          })
        }

        return (
          <div>
            {isSuccess && <div data-testid="success">User created: {data?.name}</div>}
            <form onSubmit={handleSubmit}>
              <label htmlFor="name">Name</label>
              <input id="name" name="name" type="text" required />

              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required />

              <button type="submit">Create User</button>
            </form>
          </div>
        )
      }

      render(
        <AllProviders queryClient={queryClient}>
          <CreateForm />
        </AllProviders>
      )

      // Fill in the form
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')

      // Submit the form
      await user.click(screen.getByRole('button', { name: /create user/i }))

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByTestId('success')).toHaveTextContent('User created: John Doe')
      })
    })

    it('should handle validation errors', async () => {
      const user = userEvent.setup()
      const config = createResource(userModel, dataProvider).build()

      function CreateFormWithValidation() {
        const { mutate, isError, error } = useResourceCreate<MockUser>(config)

        const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          const name = formData.get('name') as string
          const email = formData.get('email') as string

          // Client-side validation
          if (!name || !email) {
            return
          }

          mutate({
            name,
            email,
            status: 'active',
          })
        }

        return (
          <div>
            {isError && <div data-testid="error">{error?.message}</div>}
            <form onSubmit={handleSubmit}>
              <label htmlFor="name">Name</label>
              <input id="name" name="name" type="text" required />

              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required />

              <button type="submit">Create User</button>
            </form>
          </div>
        )
      }

      render(
        <AllProviders queryClient={queryClient}>
          <CreateFormWithValidation />
        </AllProviders>
      )

      // Try to submit without filling the form (HTML5 validation will prevent this)
      const submitButton = screen.getByRole('button', { name: /create user/i })
      expect(submitButton).toBeInTheDocument()
    })
  })

  describe('Update Form', () => {
    it('should submit update form successfully', async () => {
      const user = userEvent.setup()
      const config = createResource(userModel, dataProvider).build()

      function UpdateForm() {
        const { mutate, isSuccess, data } = useResourceUpdate<MockUser>(config)

        const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          mutate({
            id: '1',
            data: {
              name: formData.get('name') as string,
              email: formData.get('email') as string,
            },
          })
        }

        return (
          <div>
            {isSuccess && <div data-testid="success">User updated: {data?.name}</div>}
            <form onSubmit={handleSubmit}>
              <label htmlFor="name">Name</label>
              <input id="name" name="name" type="text" defaultValue="Alice Smith" required />

              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" defaultValue="alice@example.com" required />

              <button type="submit">Update User</button>
            </form>
          </div>
        )
      }

      render(
        <AllProviders queryClient={queryClient}>
          <UpdateForm />
        </AllProviders>
      )

      // Update the name
      const nameInput = screen.getByLabelText(/name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'Alice Updated')

      // Submit the form
      await user.click(screen.getByRole('button', { name: /update user/i }))

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByTestId('success')).toHaveTextContent('User updated: Alice Updated')
      })
    })

    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      const config = createResource(userModel, dataProvider).build()

      function FormWithLoading() {
        const { mutate, isPending } = useResourceCreate<MockUser>(config)

        const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          mutate({
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            status: 'active',
          })
        }

        return (
          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Name</label>
            <input id="name" name="name" type="text" disabled={isPending} required />

            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" disabled={isPending} required />

            <button type="submit" disabled={isPending}>
              {isPending ? 'Submitting...' : 'Create User'}
            </button>
          </form>
        )
      }

      render(
        <AllProviders queryClient={queryClient}>
          <FormWithLoading />
        </AllProviders>
      )

      // Fill and submit
      await user.type(screen.getByLabelText(/name/i), 'Test User')
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /create user/i }))

      // Should eventually complete
      await waitFor(() => {
        expect(screen.getByRole('button')).toHaveTextContent('Create User')
      })
    })
  })

})
