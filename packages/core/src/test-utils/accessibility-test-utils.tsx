/**
 * Accessibility Testing Utilities
 * Provides helpers for running accessibility tests with axe-core
 */

import { render as rtlRender } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import type { RenderResult } from '@testing-library/react'
import { expect } from 'vitest'

// Extend Vitest's expect with jest-axe matchers
expect.extend(toHaveNoViolations)

/**
 * Run axe accessibility checks on a rendered component
 */
export async function checkA11y(container: HTMLElement): Promise<void> {
  const results = await axe(container)
  expect(results).toHaveNoViolations()
}

/**
 * Render component and run accessibility checks
 */
export async function renderWithA11y(
  ui: React.ReactElement,
  options?: Parameters<typeof rtlRender>[1]
): Promise<RenderResult & { checkA11y: () => Promise<void> }> {
  const renderResult = rtlRender(ui, options)

  return {
    ...renderResult,
    checkA11y: async () => {
      await checkA11y(renderResult.container)
    },
  }
}

/**
 * Custom axe rules configuration for common scenarios
 */
export const axeRules = {
  /**
   * Strict WCAG 2.1 Level AA compliance
   */
  wcagAA: {
    runOnly: {
      type: 'tag' as const,
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    },
  },

  /**
   * Best practices (includes WCAG AA + best practices)
   */
  bestPractices: {
    runOnly: {
      type: 'tag' as const,
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
    },
  },

  /**
   * Keyboard navigation specific rules
   */
  keyboard: {
    runOnly: {
      type: 'rule' as const,
      values: [
        'accesskeys',
        'tabindex',
        'focus-order-semantics',
        'focusable-no-id',
      ],
    },
  },

  /**
   * Color and contrast rules
   */
  colorContrast: {
    runOnly: {
      type: 'rule' as const,
      values: ['color-contrast', 'link-in-text-block'],
    },
  },

  /**
   * Form and input rules
   */
  forms: {
    runOnly: {
      type: 'rule' as const,
      values: [
        'label',
        'input-button-name',
        'input-image-alt',
        'select-name',
        'form-field-multiple-labels',
      ],
    },
  },

  /**
   * ARIA rules
   */
  aria: {
    runOnly: {
      type: 'tag' as const,
      values: ['wcag2a', 'wcag2aa'],
    },
    rules: {
      'aria-allowed-attr': { enabled: true },
      'aria-hidden-focus': { enabled: true },
      'aria-input-field-name': { enabled: true },
      'aria-required-attr': { enabled: true },
      'aria-required-children': { enabled: true },
      'aria-required-parent': { enabled: true },
      'aria-roles': { enabled: true },
      'aria-valid-attr': { enabled: true },
      'aria-valid-attr-value': { enabled: true },
    },
  },
}

/**
 * Keyboard navigation helpers
 */
export const keyboard = {
  /**
   * Press Tab key
   */
  tab(): void {
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      code: 'Tab',
      keyCode: 9,
      bubbles: true,
      cancelable: true,
    })
    document.activeElement?.dispatchEvent(event)
  },

  /**
   * Press Shift+Tab
   */
  shiftTab(): void {
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      code: 'Tab',
      keyCode: 9,
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    })
    document.activeElement?.dispatchEvent(event)
  },

  /**
   * Press Enter key
   */
  enter(): void {
    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      bubbles: true,
      cancelable: true,
    })
    document.activeElement?.dispatchEvent(event)
  },

  /**
   * Press Escape key
   */
  escape(): void {
    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      bubbles: true,
      cancelable: true,
    })
    document.activeElement?.dispatchEvent(event)
  },

  /**
   * Press Space key
   */
  space(): void {
    const event = new KeyboardEvent('keydown', {
      key: ' ',
      code: 'Space',
      keyCode: 32,
      bubbles: true,
      cancelable: true,
    })
    document.activeElement?.dispatchEvent(event)
  },

  /**
   * Press Arrow Down
   */
  arrowDown(): void {
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      code: 'ArrowDown',
      keyCode: 40,
      bubbles: true,
      cancelable: true,
    })
    document.activeElement?.dispatchEvent(event)
  },

  /**
   * Press Arrow Up
   */
  arrowUp(): void {
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowUp',
      code: 'ArrowUp',
      keyCode: 38,
      bubbles: true,
      cancelable: true,
    })
    document.activeElement?.dispatchEvent(event)
  },
}

/**
 * Focus management helpers
 */
export const focus = {
  /**
   * Get currently focused element
   */
  getCurrent(): Element | null {
    return document.activeElement
  },

  /**
   * Check if element has focus
   */
  has(element: Element): boolean {
    return document.activeElement === element
  },

  /**
   * Check if focus is within element
   */
  within(container: Element): boolean {
    return container.contains(document.activeElement)
  },

  /**
   * Get all focusable elements within container
   */
  getAllFocusable(container: Element): Element[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ]

    return Array.from(
      container.querySelectorAll(focusableSelectors.join(', '))
    )
  },

  /**
   * Get first focusable element within container
   */
  getFirst(container: Element): Element | null {
    const focusable = this.getAllFocusable(container)
    return focusable[0] || null
  },

  /**
   * Get last focusable element within container
   */
  getLast(container: Element): Element | null {
    const focusable = this.getAllFocusable(container)
    return focusable[focusable.length - 1] || null
  },
}
