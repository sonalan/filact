import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProfilePage, type ProfileField } from './ProfilePage'

describe('ProfilePage', () => {
  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    bio: 'Software developer',
  }

  describe('Display Mode', () => {
    it('should render user profile in display mode', () => {
      render(<ProfilePage user={mockUser} />)

      expect(screen.getByText('Profile')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('+1234567890')).toBeInTheDocument()
      expect(screen.getByText('Software developer')).toBeInTheDocument()
    })

    it('should show edit button when editable is true', () => {
      render(<ProfilePage user={mockUser} editable={true} />)

      expect(screen.getByText('Edit Profile')).toBeInTheDocument()
    })

    it('should not show edit button when editable is false', () => {
      render(<ProfilePage user={mockUser} editable={false} />)

      expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument()
    })

    it('should show avatar placeholder with initial', () => {
      render(<ProfilePage user={mockUser} showAvatar={true} />)

      expect(screen.getByText('J')).toBeInTheDocument()
    })

    it('should show avatar image when provided', () => {
      const userWithAvatar = { ...mockUser, avatar: 'https://example.com/avatar.jpg' }
      render(<ProfilePage user={userWithAvatar} showAvatar={true} />)

      const img = screen.getByAltText('John Doe')
      expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    })

    it('should not show avatar section when showAvatar is false', () => {
      render(<ProfilePage user={mockUser} showAvatar={false} />)

      expect(screen.queryByText('J')).not.toBeInTheDocument()
    })

    it('should show dash for empty fields', () => {
      const userWithMissingFields = {
        name: 'John Doe',
        email: 'john@example.com',
      }
      render(<ProfilePage user={userWithMissingFields} />)

      const phoneField = screen.getByText('Phone').parentElement
      expect(phoneField?.textContent).toContain('-')
    })
  })

  describe('Edit Mode', () => {
    it('should switch to edit mode when edit button is clicked', () => {
      render(<ProfilePage user={mockUser} />)

      fireEvent.click(screen.getByText('Edit Profile'))

      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('Save Changes')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('should allow field changes in edit mode', () => {
      render(<ProfilePage user={mockUser} />)

      fireEvent.click(screen.getByText('Edit Profile'))

      const nameInput = screen.getByDisplayValue('John Doe') as HTMLInputElement
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } })

      expect(nameInput.value).toBe('Jane Doe')
    })

    it('should cancel edit and revert changes', () => {
      render(<ProfilePage user={mockUser} />)

      fireEvent.click(screen.getByText('Edit Profile'))

      const nameInput = screen.getByDisplayValue('John Doe') as HTMLInputElement
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } })

      fireEvent.click(screen.getByText('Cancel'))

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByDisplayValue('Jane Doe')).not.toBeInTheDocument()
    })

    it('should call onUpdate with form data on submit', async () => {
      const onUpdate = vi.fn().mockResolvedValue(undefined)
      render(<ProfilePage user={mockUser} onUpdate={onUpdate} />)

      fireEvent.click(screen.getByText('Edit Profile'))

      const nameInput = screen.getByDisplayValue('John Doe')
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } })

      fireEvent.submit(screen.getByRole('button', { name: 'Save Changes' }).closest('form')!)

      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Jane Doe',
          })
        )
      })
    })

    it('should show loading state while submitting', async () => {
      const onUpdate = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )
      render(<ProfilePage user={mockUser} onUpdate={onUpdate} />)

      fireEvent.click(screen.getByText('Edit Profile'))
      fireEvent.submit(screen.getByRole('button', { name: 'Save Changes' }).closest('form')!)

      expect(screen.getByText('Saving...')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.queryByText('Saving...')).not.toBeInTheDocument()
      })
    })

    it('should exit edit mode after successful submit', async () => {
      const onUpdate = vi.fn().mockResolvedValue(undefined)
      render(<ProfilePage user={mockUser} onUpdate={onUpdate} />)

      fireEvent.click(screen.getByText('Edit Profile'))
      fireEvent.submit(screen.getByRole('button', { name: 'Save Changes' }).closest('form')!)

      await waitFor(() => {
        expect(screen.getByText('Edit Profile')).toBeInTheDocument()
      })
    })
  })

  describe('Validation', () => {
    it('should validate required fields', async () => {
      const onUpdate = vi.fn()
      render(<ProfilePage user={mockUser} onUpdate={onUpdate} />)

      fireEvent.click(screen.getByText('Edit Profile'))

      const nameInput = screen.getByDisplayValue('John Doe')
      fireEvent.change(nameInput, { target: { value: '' } })

      fireEvent.submit(screen.getByRole('button', { name: 'Save Changes' }).closest('form')!)

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument()
      })

      expect(onUpdate).not.toHaveBeenCalled()
    })

    it('should validate email format', async () => {
      const onUpdate = vi.fn()
      render(<ProfilePage user={mockUser} onUpdate={onUpdate} />)

      fireEvent.click(screen.getByText('Edit Profile'))

      const emailInput = screen.getByDisplayValue('john@example.com')
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })

      fireEvent.submit(screen.getByRole('button', { name: 'Save Changes' }).closest('form')!)

      await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument()
      })

      expect(onUpdate).not.toHaveBeenCalled()
    })

    it('should clear error when field is corrected', async () => {
      render(<ProfilePage user={mockUser} />)

      fireEvent.click(screen.getByText('Edit Profile'))

      const emailInput = screen.getByDisplayValue('john@example.com')
      fireEvent.change(emailInput, { target: { value: 'invalid' } })

      fireEvent.submit(screen.getByRole('button', { name: 'Save Changes' }).closest('form')!)

      await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument()
      })

      fireEvent.change(emailInput, { target: { value: 'valid@example.com' } })

      expect(screen.queryByText('Invalid email address')).not.toBeInTheDocument()
    })

    it('should support custom validation', async () => {
      const fields: ProfileField[] = [
        {
          name: 'username',
          label: 'Username',
          required: true,
          validate: (value: string) => {
            if (value.length < 3) {
              return 'Username must be at least 3 characters'
            }
          },
        },
      ]

      const onUpdate = vi.fn()
      render(<ProfilePage user={{ username: 'ab' }} fields={fields} onUpdate={onUpdate} />)

      fireEvent.click(screen.getByText('Edit Profile'))
      fireEvent.submit(screen.getByRole('button', { name: 'Save Changes' }).closest('form')!)

      await waitFor(() => {
        expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument()
      })

      expect(onUpdate).not.toHaveBeenCalled()
    })
  })

  describe('Custom Fields', () => {
    it('should render custom fields', () => {
      const fields: ProfileField[] = [
        {
          name: 'company',
          label: 'Company',
          type: 'text',
        },
        {
          name: 'website',
          label: 'Website',
          type: 'url',
        },
      ]

      const user = {
        company: 'Acme Inc',
        website: 'https://acme.com',
      }

      render(<ProfilePage user={user} fields={fields} />)

      expect(screen.getByText('Acme Inc')).toBeInTheDocument()
      expect(screen.getByText('https://acme.com')).toBeInTheDocument()
    })

    it('should render textarea fields', () => {
      const fields: ProfileField[] = [
        {
          name: 'bio',
          label: 'Bio',
          type: 'textarea',
        },
      ]

      render(<ProfilePage user={{ bio: 'Test bio' }} fields={fields} />)

      fireEvent.click(screen.getByText('Edit Profile'))

      expect(screen.getByDisplayValue('Test bio').tagName).toBe('TEXTAREA')
    })

    it('should render select fields', () => {
      const fields: ProfileField[] = [
        {
          name: 'role',
          label: 'Role',
          type: 'select',
          options: [
            { value: 'admin', label: 'Admin' },
            { value: 'user', label: 'User' },
          ],
        },
      ]

      render(<ProfilePage user={{ role: 'admin' }} fields={fields} />)

      fireEvent.click(screen.getByText('Edit Profile'))

      const select = screen.getByDisplayValue('Admin') as HTMLSelectElement
      expect(select.tagName).toBe('SELECT')
      expect(select.options.length).toBe(3) // Including "Select..." option
    })

    it('should format field values for display', () => {
      const fields: ProfileField[] = [
        {
          name: 'joinDate',
          label: 'Join Date',
          format: (value: string) => new Date(value).toLocaleDateString(),
        },
      ]

      const user = {
        joinDate: '2024-01-15',
      }

      render(<ProfilePage user={user} fields={fields} />)

      expect(screen.getByText(new Date('2024-01-15').toLocaleDateString())).toBeInTheDocument()
    })

    it('should render non-editable fields as display only in edit mode', () => {
      const fields: ProfileField[] = [
        {
          name: 'id',
          label: 'ID',
          editable: false,
        },
        {
          name: 'name',
          label: 'Name',
          editable: true,
        },
      ]

      const user = {
        id: '123',
        name: 'John Doe',
      }

      render(<ProfilePage user={user} fields={fields} />)

      fireEvent.click(screen.getByText('Edit Profile'))

      // ID should be display-only
      expect(screen.getByText('123')).toBeInTheDocument()
      expect(screen.queryByDisplayValue('123')).not.toBeInTheDocument()

      // Name should be editable
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    })
  })

  describe('Custom Components', () => {
    it('should use custom avatar component', () => {
      const CustomAvatar = ({ user }: any) => <div>Custom Avatar: {user.name}</div>

      render(<ProfilePage user={mockUser} avatarComponent={CustomAvatar} />)

      expect(screen.getByText('Custom Avatar: John Doe')).toBeInTheDocument()
    })

    it('should use custom form component in edit mode', () => {
      const CustomForm = ({ user }: any) => <div>Custom Form: {user.name}</div>

      render(<ProfilePage user={mockUser} formComponent={CustomForm} />)

      fireEvent.click(screen.getByText('Edit Profile'))

      expect(screen.getByText('Custom Form: John Doe')).toBeInTheDocument()
    })

    it('should call onUpload in avatar component when in edit mode', () => {
      const onUpload = vi.fn()
      const CustomAvatar = ({ onUpload: upload }: any) => (
        <button onClick={() => upload?.(new File([], 'avatar.jpg'))}>Upload</button>
      )

      const onUpdate = vi.fn().mockResolvedValue(undefined)
      render(
        <ProfilePage user={mockUser} avatarComponent={CustomAvatar} onUpdate={onUpdate} />
      )

      fireEvent.click(screen.getByText('Edit Profile'))
      fireEvent.click(screen.getByText('Upload'))

      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          avatar: expect.any(File),
        })
      )
    })
  })
})
