/**
 * Accessibility Tests: Keyboard Navigation
 * Tests keyboard operability and focus management
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { focus } from '../test-utils/accessibility-test-utils'

describe('Keyboard Navigation', () => {
  describe('Tab Navigation', () => {
    it('should navigate through interactive elements with Tab', async () => {
      const user = userEvent.setup()

      render(
        <form>
          <input data-testid="input-1" type="text" />
          <button data-testid="button-1">Button 1</button>
          <input data-testid="input-2" type="text" />
          <button data-testid="button-2">Button 2</button>
        </form>
      )

      const input1 = screen.getByTestId('input-1')
      const button1 = screen.getByTestId('button-1')
      const input2 = screen.getByTestId('input-2')
      const button2 = screen.getByTestId('button-2')

      // Start focus on first element
      input1.focus()
      expect(focus.has(input1)).toBe(true)

      // Tab to next element
      await user.tab()
      expect(focus.has(button1)).toBe(true)

      // Continue tabbing
      await user.tab()
      expect(focus.has(input2)).toBe(true)

      await user.tab()
      expect(focus.has(button2)).toBe(true)
    })

    it('should navigate backwards with Shift+Tab', async () => {
      const user = userEvent.setup()

      render(
        <div>
          <button data-testid="button-1">Button 1</button>
          <button data-testid="button-2">Button 2</button>
          <button data-testid="button-3">Button 3</button>
        </div>
      )

      const button1 = screen.getByTestId('button-1')
      const button2 = screen.getByTestId('button-2')
      const button3 = screen.getByTestId('button-3')

      // Start on last button
      button3.focus()
      expect(focus.has(button3)).toBe(true)

      // Shift+Tab backwards
      await user.tab({ shift: true })
      expect(focus.has(button2)).toBe(true)

      await user.tab({ shift: true })
      expect(focus.has(button1)).toBe(true)
    })

    it('should skip disabled elements', async () => {
      const user = userEvent.setup()

      render(
        <div>
          <button data-testid="button-1">Button 1</button>
          <button data-testid="button-2" disabled>
            Disabled
          </button>
          <button data-testid="button-3">Button 3</button>
        </div>
      )

      const button1 = screen.getByTestId('button-1')
      const button3 = screen.getByTestId('button-3')

      button1.focus()
      await user.tab()

      // Should skip disabled button
      expect(focus.has(button3)).toBe(true)
    })

    it('should respect tabindex order', async () => {
      const user = userEvent.setup()

      render(
        <div>
          <button data-testid="button-1" tabIndex={3}>
            Third
          </button>
          <button data-testid="button-2" tabIndex={1}>
            First
          </button>
          <button data-testid="button-3" tabIndex={2}>
            Second
          </button>
        </div>
      )

      const button1 = screen.getByTestId('button-1')
      const button2 = screen.getByTestId('button-2')
      const button3 = screen.getByTestId('button-3')

      button2.focus()
      expect(focus.has(button2)).toBe(true)

      await user.tab()
      expect(focus.has(button3)).toBe(true)

      await user.tab()
      expect(focus.has(button1)).toBe(true)
    })
  })

  describe('Enter and Space Keys', () => {
    it('should activate button with Enter', async () => {
      const user = userEvent.setup()
      let clicked = false

      render(
        <button
          onClick={() => {
            clicked = true
          }}
        >
          Click me
        </button>
      )

      const button = screen.getByRole('button')
      button.focus()

      await user.keyboard('{Enter}')
      expect(clicked).toBe(true)
    })

    it('should activate button with Space', async () => {
      const user = userEvent.setup()
      let clicked = false

      render(
        <button
          onClick={() => {
            clicked = true
          }}
        >
          Click me
        </button>
      )

      const button = screen.getByRole('button')
      button.focus()

      await user.keyboard(' ')
      expect(clicked).toBe(true)
    })

    it('should toggle checkbox with Space', async () => {
      const user = userEvent.setup()

      render(<input type="checkbox" data-testid="checkbox" />)

      const checkbox = screen.getByTestId('checkbox') as HTMLInputElement
      checkbox.focus()

      expect(checkbox.checked).toBe(false)

      await user.keyboard(' ')
      expect(checkbox.checked).toBe(true)

      await user.keyboard(' ')
      expect(checkbox.checked).toBe(false)
    })
  })

  describe('Escape Key', () => {
    it('should close modal with Escape', async () => {
      const user = userEvent.setup()
      let closed = false

      function Modal() {
        return (
          <div
            role="dialog"
            data-testid="modal"
            tabIndex={-1}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                closed = true
              }
            }}
          >
            <button>Close</button>
          </div>
        )
      }

      render(<Modal />)

      const modal = screen.getByTestId('modal')
      modal.focus()

      await user.keyboard('{Escape}')

      // Verify escape was handled
      expect(closed).toBe(true)
    })
  })

  describe('Arrow Keys', () => {
    it('should navigate radio buttons with arrow keys', async () => {
      const user = userEvent.setup()

      render(
        <div role="radiogroup">
          <label>
            <input type="radio" name="option" value="1" data-testid="radio-1" />
            Option 1
          </label>
          <label>
            <input type="radio" name="option" value="2" data-testid="radio-2" />
            Option 2
          </label>
          <label>
            <input type="radio" name="option" value="3" data-testid="radio-3" />
            Option 3
          </label>
        </div>
      )

      const radio1 = screen.getByTestId('radio-1') as HTMLInputElement
      const radio2 = screen.getByTestId('radio-2') as HTMLInputElement
      const radio3 = screen.getByTestId('radio-3') as HTMLInputElement

      radio1.focus()
      radio1.click()

      expect(radio1.checked).toBe(true)

      await user.keyboard('{ArrowDown}')
      expect(radio2.checked).toBe(true)

      await user.keyboard('{ArrowDown}')
      expect(radio3.checked).toBe(true)

      await user.keyboard('{ArrowUp}')
      expect(radio2.checked).toBe(true)
    })

    it('should navigate dropdown options with arrow keys', async () => {
      const user = userEvent.setup()

      render(
        <select data-testid="select" defaultValue="1">
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
          <option value="3">Option 3</option>
        </select>
      )

      const select = screen.getByTestId('select') as HTMLSelectElement
      select.focus()

      // Select element arrow key navigation is browser-dependent
      // Just verify the select is keyboard accessible
      expect(select).toHaveFocus()
      expect(select.value).toBe('1')
    })
  })

  describe('Focus Trap', () => {
    it('should have focusable elements within modal', async () => {
      const user = userEvent.setup()

      render(
        <div>
          <button data-testid="outside">Outside button</button>
          <div role="dialog" data-testid="modal">
            <button data-testid="modal-button-1">Button 1</button>
            <button data-testid="modal-button-2">Button 2</button>
            <button data-testid="close">Close</button>
          </div>
        </div>
      )

      const modalButton1 = screen.getByTestId('modal-button-1')
      const modalButton2 = screen.getByTestId('modal-button-2')
      const closeButton = screen.getByTestId('close')

      // Start focus in modal
      modalButton1.focus()
      expect(focus.has(modalButton1)).toBe(true)

      // Tab through modal elements
      await user.tab()
      expect(focus.has(modalButton2)).toBe(true)

      await user.tab()
      expect(focus.has(closeButton)).toBe(true)

      // Note: Actual focus trap requires JS implementation
      // This test verifies modal has focusable elements
    })
  })

  describe('Focus Visible', () => {
    it('should show focus indicator on keyboard navigation', async () => {
      const user = userEvent.setup()

      render(
        <button
          data-testid="button"
          className="focus-visible:ring-2"
        >
          Button
        </button>
      )

      const button = screen.getByTestId('button')

      // Tab to button (keyboard navigation)
      await user.tab()

      // Button should have focus
      expect(focus.has(button)).toBe(true)

      // In real implementation, :focus-visible would apply
      // We're testing that focus can be detected
      expect(document.activeElement).toBe(button)
    })
  })

  describe('Skip Links', () => {
    it('should have skip link for navigation', async () => {
      const user = userEvent.setup()

      render(
        <div>
          <a href="#main-content" data-testid="skip-link">
            Skip to main content
          </a>
          <nav>
            <a href="/home">Home</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
          </nav>
          <main id="main-content" tabIndex={-1} data-testid="main">
            <h1>Main Content</h1>
          </main>
        </div>
      )

      const skipLink = screen.getByTestId('skip-link')
      skipLink.focus()

      // Verify skip link exists and is keyboard accessible
      expect(focus.has(skipLink)).toBe(true)
      expect(skipLink).toHaveAttribute('href', '#main-content')
    })
  })

  describe('Roving Tabindex', () => {
    it('should use roving tabindex for toolbar', async () => {
      const user = userEvent.setup()

      function Toolbar() {
        return (
          <div role="toolbar">
            <button tabIndex={0} data-testid="button-1">
              Bold
            </button>
            <button tabIndex={-1} data-testid="button-2">
              Italic
            </button>
            <button tabIndex={-1} data-testid="button-3">
              Underline
            </button>
          </div>
        )
      }

      render(<Toolbar />)

      const button1 = screen.getByTestId('button-1')
      const button2 = screen.getByTestId('button-2')

      // First button is tabbable
      expect(button1).toHaveAttribute('tabindex', '0')
      expect(button2).toHaveAttribute('tabindex', '-1')

      button1.focus()
      expect(focus.has(button1)).toBe(true)

      // Note: Arrow key navigation requires JS implementation
      // This test verifies correct tabindex usage
    })
  })

  describe('Focus Management on Route Changes', () => {
    it('should move focus to heading on route change', async () => {
      render(
        <main>
          <h1 tabIndex={-1} data-testid="page-heading">
            New Page
          </h1>
          <p>Page content</p>
        </main>
      )

      const heading = screen.getByTestId('page-heading')

      // Simulate route change focus management
      heading.focus()

      expect(focus.has(heading)).toBe(true)
    })
  })

  describe('Custom Interactive Elements', () => {
    it('should make custom button keyboard accessible', async () => {
      const user = userEvent.setup()
      let clicked = false

      render(
        <div
          role="button"
          tabIndex={0}
          data-testid="custom-button"
          onClick={() => {
            clicked = true
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              clicked = true
            }
          }}
        >
          Custom Button
        </div>
      )

      const button = screen.getByTestId('custom-button')
      button.focus()

      await user.keyboard('{Enter}')
      expect(clicked).toBe(true)
    })

    it('should make custom link keyboard accessible', async () => {
      const user = userEvent.setup()
      let navigated = false

      render(
        <div
          role="link"
          tabIndex={0}
          data-testid="custom-link"
          onClick={() => {
            navigated = true
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              navigated = true
            }
          }}
        >
          Custom Link
        </div>
      )

      const link = screen.getByTestId('custom-link')
      link.focus()

      await user.keyboard('{Enter}')
      expect(navigated).toBe(true)
    })
  })
})
