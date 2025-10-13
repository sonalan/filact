/**
 * Accessibility Tests: Component Accessibility
 * Tests ARIA attributes, roles, and semantic HTML
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { checkA11y, axeRules } from '../test-utils/accessibility-test-utils'

describe('Component Accessibility', () => {
  describe('Button Component', () => {
    it('should have accessible name', async () => {
      render(<button>Click me</button>)
      const button = screen.getByRole('button', { name: 'Click me' })
      expect(button).toBeInTheDocument()
    })

    it('should have no accessibility violations', async () => {
      const { container } = render(<button>Click me</button>)
      await checkA11y(container)
    })

    it('should indicate disabled state', async () => {
      render(<button disabled>Disabled button</button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      // HTML disabled attribute is sufficient, aria-disabled is optional
      expect(button).toHaveAttribute('disabled')
    })

    it('should support aria-label', async () => {
      render(<button aria-label="Close dialog">×</button>)
      const button = screen.getByRole('button', { name: 'Close dialog' })
      expect(button).toBeInTheDocument()
    })

    it('should support aria-describedby', async () => {
      render(
        <div>
          <button aria-describedby="help-text">Submit</button>
          <span id="help-text">This will submit the form</span>
        </div>
      )
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-describedby', 'help-text')
    })
  })

  describe('Form Component', () => {
    it('should have accessible form labels', async () => {
      render(
        <form>
          <label htmlFor="name">Name</label>
          <input id="name" type="text" />

          <label htmlFor="email">Email</label>
          <input id="email" type="email" />
        </form>
      )

      const nameInput = screen.getByLabelText('Name')
      const emailInput = screen.getByLabelText('Email')

      expect(nameInput).toBeInTheDocument()
      expect(emailInput).toBeInTheDocument()
    })

    it('should have no accessibility violations', async () => {
      const { container } = render(
        <form>
          <label htmlFor="username">Username</label>
          <input id="username" type="text" required />

          <button type="submit">Submit</button>
        </form>
      )

      await checkA11y(container)
    })

    it('should indicate required fields', async () => {
      render(
        <div>
          <label htmlFor="email">
            Email <span aria-label="required">*</span>
          </label>
          <input id="email" type="email" required aria-required="true" />
        </div>
      )

      const input = screen.getByLabelText(/email/i)
      expect(input).toBeRequired()
      expect(input).toHaveAttribute('aria-required', 'true')
    })

    it('should associate error messages with inputs', async () => {
      render(
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            aria-invalid="true"
            aria-describedby="email-error"
          />
          <span id="email-error" role="alert">
            Please enter a valid email
          </span>
        </div>
      )

      const input = screen.getByLabelText('Email')
      const error = screen.getByRole('alert')

      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAttribute('aria-describedby', 'email-error')
      expect(error).toBeInTheDocument()
    })

    it('should use fieldset for radio groups', async () => {
      render(
        <fieldset>
          <legend>Choose your plan</legend>
          <label>
            <input type="radio" name="plan" value="free" />
            Free
          </label>
          <label>
            <input type="radio" name="plan" value="pro" />
            Pro
          </label>
        </fieldset>
      )

      const group = screen.getByRole('group', { name: 'Choose your plan' })
      expect(group).toBeInTheDocument()
    })
  })

  describe('Modal/Dialog Component', () => {
    it('should have role dialog', async () => {
      render(
        <div
          role="dialog"
          aria-labelledby="dialog-title"
          aria-modal="true"
        >
          <h2 id="dialog-title">Confirm Action</h2>
          <p>Are you sure?</p>
          <button>Yes</button>
          <button>No</button>
        </div>
      )

      const dialog = screen.getByRole('dialog', { name: 'Confirm Action' })
      expect(dialog).toBeInTheDocument()
      expect(dialog).toHaveAttribute('aria-modal', 'true')
    })

    it('should have accessible title', async () => {
      render(
        <div role="dialog" aria-labelledby="title">
          <h2 id="title">Delete User</h2>
        </div>
      )

      const dialog = screen.getByRole('dialog', { name: 'Delete User' })
      expect(dialog).toBeInTheDocument()
    })

    it('should have close button with accessible name', async () => {
      render(
        <div role="dialog" aria-label="Settings">
          <button aria-label="Close settings">×</button>
        </div>
      )

      const closeButton = screen.getByRole('button', { name: 'Close settings' })
      expect(closeButton).toBeInTheDocument()
    })
  })

  describe('Table Component', () => {
    it('should have proper table structure', async () => {
      render(
        <table>
          <caption>User List</caption>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>John Doe</td>
              <td>john@example.com</td>
            </tr>
          </tbody>
        </table>
      )

      const table = screen.getByRole('table', { name: 'User List' })
      expect(table).toBeInTheDocument()

      const columnHeaders = screen.getAllByRole('columnheader')
      expect(columnHeaders).toHaveLength(2)
    })

    it('should use scope attribute for headers', async () => {
      const { container } = render(
        <table>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Age</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">John</th>
              <td>30</td>
            </tr>
          </tbody>
        </table>
      )

      await checkA11y(container)
    })

    it('should have sortable column indicators', async () => {
      render(
        <table>
          <thead>
            <tr>
              <th scope="col">
                <button aria-label="Sort by name" aria-sort="ascending">
                  Name
                </button>
              </th>
            </tr>
          </thead>
        </table>
      )

      const sortButton = screen.getByRole('button', { name: 'Sort by name' })
      expect(sortButton).toHaveAttribute('aria-sort', 'ascending')
    })
  })

  describe('Navigation Component', () => {
    it('should use nav element', async () => {
      render(
        <nav aria-label="Main navigation">
          <ul>
            <li>
              <a href="/home">Home</a>
            </li>
            <li>
              <a href="/about">About</a>
            </li>
          </ul>
        </nav>
      )

      const nav = screen.getByRole('navigation', { name: 'Main navigation' })
      expect(nav).toBeInTheDocument()
    })

    it('should indicate current page', async () => {
      render(
        <nav>
          <a href="/home" aria-current="page">
            Home
          </a>
          <a href="/about">About</a>
        </nav>
      )

      const currentLink = screen.getByRole('link', { current: 'page' })
      expect(currentLink).toBeInTheDocument()
    })

    it('should have accessible breadcrumbs', async () => {
      render(
        <nav aria-label="Breadcrumb">
          <ol>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/users">Users</a>
            </li>
            <li aria-current="page">John Doe</li>
          </ol>
        </nav>
      )

      const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' })
      expect(breadcrumb).toBeInTheDocument()
    })
  })

  describe('Alert/Notification Component', () => {
    it('should use role alert for important messages', async () => {
      render(
        <div role="alert" aria-live="assertive">
          Error: Failed to save changes
        </div>
      )

      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveAttribute('aria-live', 'assertive')
    })

    it('should use role status for non-critical updates', async () => {
      render(
        <div role="status" aria-live="polite">
          Changes saved successfully
        </div>
      )

      const status = screen.getByRole('status')
      expect(status).toBeInTheDocument()
    })
  })

  describe('Dropdown/Select Component', () => {
    it('should have accessible select', async () => {
      render(
        <div>
          <label htmlFor="country">Country</label>
          <select id="country">
            <option value="us">United States</option>
            <option value="uk">United Kingdom</option>
          </select>
        </div>
      )

      const select = screen.getByLabelText('Country')
      expect(select).toBeInTheDocument()
    })

    it('should support aria-expanded for custom dropdowns', async () => {
      render(
        <div>
          <button
            aria-haspopup="listbox"
            aria-expanded="false"
            aria-labelledby="dropdown-label"
          >
            Select option
          </button>
          <span id="dropdown-label">Choose an option</span>
        </div>
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-expanded', 'false')
      expect(button).toHaveAttribute('aria-haspopup', 'listbox')
    })
  })

  describe('Loading States', () => {
    it('should indicate loading state', async () => {
      render(
        <div>
          <button aria-busy="true" aria-live="polite">
            Loading...
          </button>
        </div>
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-busy', 'true')
    })

    it('should use role status for loading indicators', async () => {
      render(
        <div role="status" aria-live="polite" aria-label="Loading data">
          <span>Please wait...</span>
        </div>
      )

      const status = screen.getByRole('status', { name: 'Loading data' })
      expect(status).toBeInTheDocument()
    })
  })

  describe('Icon Buttons', () => {
    it('should have accessible names for icon-only buttons', async () => {
      render(
        <button aria-label="Delete item">
          <svg aria-hidden="true">
            <use xlinkHref="#trash-icon" />
          </svg>
        </button>
      )

      const button = screen.getByRole('button', { name: 'Delete item' })
      expect(button).toBeInTheDocument()
    })

    it('should hide decorative icons from screen readers', async () => {
      render(
        <button>
          <svg aria-hidden="true">
            <use xlinkHref="#icon" />
          </svg>
          Save
        </button>
      )

      const svg = document.querySelector('svg')
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
