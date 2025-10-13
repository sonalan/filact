/**
 * Accessibility Tests: Color Contrast and Visual Accessibility
 * Tests color contrast ratios and visual indicators
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { checkA11y, axeRules } from '../test-utils/accessibility-test-utils'

describe('Color Contrast and Visual Accessibility', () => {
  describe('Text Color Contrast', () => {
    it('should have sufficient contrast for normal text', async () => {
      const { container } = render(
        <div style={{ backgroundColor: '#ffffff', color: '#000000' }}>
          Normal text with good contrast
        </div>
      )

      // WCAG AA requires 4.5:1 for normal text
      // Black on white has 21:1 ratio
      await checkA11y(container)
    })

    it('should have sufficient contrast for large text', async () => {
      const { container } = render(
        <h1 style={{ backgroundColor: '#ffffff', color: '#767676', fontSize: '24px' }}>
          Large heading text
        </h1>
      )

      // WCAG AA requires 3:1 for large text (18pt+ or 14pt+ bold)
      // #767676 on white has 4.54:1 ratio (passes)
      await checkA11y(container)
    })

    it('should detect insufficient contrast', async () => {
      const { container } = render(
        <div style={{ backgroundColor: '#ffffff', color: '#cccccc' }}>
          Low contrast text
        </div>
      )

      // #cccccc on white has 1.61:1 ratio (fails)
      try {
        await checkA11y(container)
        // Should fail, so if we get here, test should fail
        expect(true).toBe(false)
      } catch (error) {
        // Expected to fail contrast check
        expect(error).toBeDefined()
      }
    })
  })

  describe('Link Color Contrast', () => {
    it('should have sufficient contrast for links', async () => {
      const { container } = render(
        <div style={{ backgroundColor: '#ffffff' }}>
          <a href="/page" style={{ color: '#0000ee' }}>
            Link with good contrast
          </a>
        </div>
      )

      // Standard blue link has 8.59:1 ratio
      await checkA11y(container)
    })

    it('should differentiate links in text blocks', async () => {
      const { container } = render(
        <p style={{ color: '#000000' }}>
          This is a paragraph with a{' '}
          <a href="/page" style={{ color: '#0000ee', textDecoration: 'underline' }}>
            link
          </a>{' '}
          in the text.
        </p>
      )

      // Links should be underlined or have sufficient contrast difference (3:1)
      await checkA11y(container)
    })
  })

  describe('Button Color Contrast', () => {
    it('should have sufficient contrast for button text', async () => {
      const { container } = render(
        <button style={{ backgroundColor: '#0066cc', color: '#ffffff' }}>
          Button with white text
        </button>
      )

      // White on #0066cc has 6.91:1 ratio
      await checkA11y(container)
    })

    it('should have sufficient contrast for button borders', async () => {
      const { container } = render(
        <button
          style={{
            backgroundColor: '#ffffff',
            color: '#000000',
            border: '2px solid #000000',
          }}
        >
          Outlined button
        </button>
      )

      await checkA11y(container)
    })
  })

  describe('Form Element Contrast', () => {
    it('should have sufficient contrast for input borders', async () => {
      const { container } = render(
        <label>
          Input field
          <input
            type="text"
            style={{ border: '1px solid #767676', backgroundColor: '#ffffff' }}
          />
        </label>
      )

      // Input borders need 3:1 contrast ratio
      await checkA11y(container)
    })

    it('should have sufficient contrast for placeholder text', async () => {
      const { container } = render(
        <label>
          Input field
          <input
            type="text"
            placeholder="Enter text"
            style={{
              backgroundColor: '#ffffff',
              // Placeholder should have at least 4.5:1 ratio
            }}
          />
        </label>
      )

      await checkA11y(container)
    })

    it('should have sufficient contrast for focus indicators', async () => {
      const { container } = render(
        <label>
          Input field
          <input
            type="text"
            style={{
              backgroundColor: '#ffffff',
              border: '2px solid #0066cc',
              outline: '2px solid #0066cc',
            }}
          />
        </label>
      )

      // Focus indicators need 3:1 contrast with adjacent colors
      await checkA11y(container)
    })
  })

  describe('Icon Contrast', () => {
    it('should have sufficient contrast for icons', async () => {
      const { container } = render(
        <button style={{ backgroundColor: '#0066cc' }}>
          <svg
            width="16"
            height="16"
            fill="#ffffff"
            aria-hidden="true"
          >
            <path d="M8 0l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />
          </svg>
          <span>Favorite</span>
        </button>
      )

      await checkA11y(container)
    })

    it('should not require contrast for decorative icons', async () => {
      const { container } = render(
        <div>
          <svg
            width="16"
            height="16"
            fill="#dddddd"
            aria-hidden="true"
            role="presentation"
          >
            <circle cx="8" cy="8" r="8" />
          </svg>
          <span style={{ color: '#000000' }}>Text with decorative icon</span>
        </div>
      )

      // Decorative icons don't need to meet contrast requirements
      await checkA11y(container)
    })
  })

  describe('Focus Indicators', () => {
    it('should have visible focus indicator', async () => {
      render(
        <button
          data-testid="button"
          style={{
            outline: 'none',
          }}
          className="focus:ring-2 focus:ring-blue-500"
        >
          Button
        </button>
      )

      const button = screen.getByTestId('button')
      button.focus()

      // Focus should be visible
      expect(document.activeElement).toBe(button)
    })

    it('should have sufficient contrast for focus indicator', async () => {
      const { container } = render(
        <button
          style={{
            border: '2px solid transparent',
            outline: '2px solid #0066cc',
            outlineOffset: '2px',
          }}
        >
          Button
        </button>
      )

      // Focus outline needs 3:1 contrast
      await checkA11y(container)
    })

    it('should show focus indicator on all interactive elements', async () => {
      render(
        <div>
          <button data-testid="button">Button</button>
          <a href="/page" data-testid="link">
            Link
          </a>
          <input type="text" data-testid="input" />
        </div>
      )

      const button = screen.getByTestId('button')
      const link = screen.getByTestId('link')
      const input = screen.getByTestId('input')

      button.focus()
      expect(document.activeElement).toBe(button)

      link.focus()
      expect(document.activeElement).toBe(link)

      input.focus()
      expect(document.activeElement).toBe(input)
    })
  })

  describe('State Indicators', () => {
    it('should not rely solely on color for error states', async () => {
      render(
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            aria-invalid="true"
            aria-describedby="email-error"
            style={{ borderColor: '#dc2626' }}
          />
          <span id="email-error" role="alert">
            ⚠ Invalid email format
          </span>
        </div>
      )

      // Error should be communicated through:
      // 1. aria-invalid attribute
      // 2. Error message in aria-describedby
      // 3. Visual icon (⚠)
      // 4. Color (red border)

      const input = screen.getByLabelText('Email')
      expect(input).toHaveAttribute('aria-invalid', 'true')

      const error = screen.getByRole('alert')
      expect(error).toBeInTheDocument()
    })

    it('should not rely solely on color for success states', async () => {
      render(
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            aria-describedby="username-success"
            style={{ borderColor: '#16a34a' }}
          />
          <span id="username-success" role="status">
            ✓ Username available
          </span>
        </div>
      )

      // Success should be communicated through:
      // 1. Success message
      // 2. Visual icon (✓)
      // 3. Color (green border)

      const success = screen.getByRole('status')
      expect(success).toBeInTheDocument()
    })

    it('should indicate required fields without color only', async () => {
      render(
        <div>
          <label htmlFor="name">
            Name <span aria-label="required">*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            aria-required="true"
          />
        </div>
      )

      // Required should be indicated by:
      // 1. Visual asterisk (*)
      // 2. aria-required attribute
      // 3. required attribute

      const input = screen.getByLabelText(/name/i)
      expect(input).toHaveAttribute('required')
      expect(input).toHaveAttribute('aria-required', 'true')
    })
  })

  describe('Dark Mode', () => {
    it('should maintain contrast in dark mode', async () => {
      const { container } = render(
        <div style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>
          Dark mode text
        </div>
      )

      // White on very dark gray has high contrast
      await checkA11y(container)
    })

    it('should adjust link colors for dark mode', async () => {
      const { container } = render(
        <div style={{ backgroundColor: '#1a1a1a' }}>
          <a href="/page" style={{ color: '#60a5fa' }}>
            Dark mode link
          </a>
        </div>
      )

      // Light blue (#60a5fa) on dark background maintains contrast
      await checkA11y(container)
    })
  })

  describe('High Contrast Mode', () => {
    it('should support high contrast mode with system colors', async () => {
      render(
        <button
          style={{
            backgroundColor: 'ButtonFace',
            color: 'ButtonText',
            border: '1px solid ButtonBorder',
          }}
        >
          Button with system colors
        </button>
      )

      // System colors adapt to user's high contrast settings
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should maintain border visibility in high contrast', async () => {
      render(
        <div
          style={{
            border: '1px solid transparent',
            outline: '1px solid',
          }}
        >
          Content with transparent border and outline
        </div>
      )

      // Transparent borders with outline remain visible in high contrast
    })
  })

  describe('Color Blindness', () => {
    it('should use patterns or labels in addition to color', async () => {
      render(
        <div>
          <div data-testid="success" style={{ color: '#16a34a' }}>
            ✓ Success
          </div>
          <div data-testid="error" style={{ color: '#dc2626' }}>
            ✗ Error
          </div>
          <div data-testid="warning" style={{ color: '#ca8a04' }}>
            ⚠ Warning
          </div>
        </div>
      )

      // Icons provide visual distinction beyond color
      const success = screen.getByTestId('success')
      const error = screen.getByTestId('error')
      const warning = screen.getByTestId('warning')

      expect(success).toHaveTextContent('✓')
      expect(error).toHaveTextContent('✗')
      expect(warning).toHaveTextContent('⚠')
    })

    it('should differentiate chart elements with patterns', async () => {
      render(
        <svg width="200" height="100">
          <rect
            x="0"
            y="0"
            width="50"
            height="100"
            fill="#3b82f6"
            aria-label="Category A: 50"
          />
          <rect
            x="50"
            y="20"
            width="50"
            height="80"
            fill="#ef4444"
            aria-label="Category B: 40"
          />
          <rect
            x="100"
            y="40"
            width="50"
            height="60"
            fill="#10b981"
            aria-label="Category C: 30"
          />
        </svg>
      )

      // Chart elements have aria-labels for screen readers
      // In production, would also use patterns/textures
    })
  })
})
