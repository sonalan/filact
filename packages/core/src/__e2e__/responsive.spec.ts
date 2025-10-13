/**
 * E2E Tests: Responsive Behavior
 * Tests responsive design and mobile functionality
 */

import { test, expect } from '@playwright/test'

test.describe('Responsive Behavior', () => {
  test('mobile: navigation menu toggles correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/users')

    // Mobile menu should be hidden initially
    await expect(page.locator('[data-testid="mobile-menu"]')).not.toBeVisible()

    // Click hamburger menu
    await page.click('[data-testid="menu-toggle"]')

    // Mobile menu should be visible
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()

    // Click close or outside to close menu
    await page.click('[data-testid="menu-close"]')

    // Mobile menu should be hidden again
    await expect(page.locator('[data-testid="mobile-menu"]')).not.toBeVisible()
  })

  test('mobile: table displays as cards', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/users')

    // Desktop table should be hidden
    await expect(page.locator('[data-testid="desktop-table"]')).not.toBeVisible()

    // Mobile cards should be visible
    await expect(page.locator('[data-testid="mobile-cards"]')).toBeVisible()

    // Verify cards contain user data
    await expect(page.locator('[data-testid="user-card"]').first()).toBeVisible()
  })

  test('tablet: layout adapts to medium screen', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/users')

    // Sidebar should be collapsible on tablet
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible()

    // Table should be visible but may have horizontal scroll
    await expect(page.locator('[data-testid="desktop-table"]')).toBeVisible()
  })

  test('desktop: full layout is visible', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/users')

    // Sidebar should be fully visible
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible()

    // Full table should be visible
    await expect(page.locator('[data-testid="desktop-table"]')).toBeVisible()

    // Mobile-specific elements should be hidden
    await expect(page.locator('[data-testid="menu-toggle"]')).not.toBeVisible()
  })

  test('mobile: form inputs are touch-friendly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/users')

    // Open create form
    await page.click('text=Create User')

    // Verify inputs have minimum touch target size (44x44px)
    const nameInput = page.locator('input[name="name"]')
    const box = await nameInput.boundingBox()

    expect(box?.height).toBeGreaterThanOrEqual(44)
  })

  test('mobile: buttons are appropriately sized', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/users')

    // Check create button size
    const createButton = page.locator('button:has-text("Create User")')
    const box = await createButton.boundingBox()

    expect(box?.height).toBeGreaterThanOrEqual(44)
  })

  test('mobile: scrolling works correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/users')

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Verify footer or bottom element is visible
    await expect(page.locator('[data-testid="page-footer"]')).toBeVisible()
  })

  test('orientation change: portrait to landscape', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/users')

    // Verify mobile layout
    await expect(page.locator('[data-testid="mobile-cards"]')).toBeVisible()

    // Switch to landscape
    await page.setViewportSize({ width: 667, height: 375 })

    // Layout should adapt
    await expect(page.locator('[data-testid="desktop-table"]')).toBeVisible()
  })

  test('mobile: pagination controls are accessible', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/users')

    // Pagination should be visible and usable
    await expect(page.locator('button:has-text("Next")')).toBeVisible()
    await expect(page.locator('button:has-text("Previous")')).toBeVisible()

    // Click next button
    await page.click('button:has-text("Next")')

    // Verify page changed
    await expect(page.locator('text=Page 2')).toBeVisible()
  })

  test('mobile: dropdown menus work correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/users')

    // Open filter dropdown
    await page.click('button:has-text("Filter")')

    // Dropdown should be visible
    await expect(page.locator('[data-testid="filter-dropdown"]')).toBeVisible()

    // Select an option
    await page.click('text=Active')

    // Dropdown should close
    await expect(page.locator('[data-testid="filter-dropdown"]')).not.toBeVisible()
  })

  test('mobile: modal dialogs are fullscreen', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/users')

    // Open create form (should be in modal on mobile)
    await page.click('text=Create User')

    // Modal should be fullscreen on mobile
    const modal = page.locator('[data-testid="modal"]')
    const box = await modal.boundingBox()

    expect(box?.width).toBe(375)
  })

  test('tablet: side panel behavior', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/users')

    // Click on a user
    await page.click('[data-testid="user-row"]:first-child')

    // Side panel or modal should open
    await expect(
      page.locator('[data-testid="detail-panel"], [data-testid="modal"]')
    ).toBeVisible()
  })

  test('desktop: multi-column layout', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/users')

    // Click on a user
    await page.click('[data-testid="user-row"]:first-child')

    // Detail view should open in side panel (not modal)
    await expect(page.locator('[data-testid="detail-panel"]')).toBeVisible()

    // Table should still be visible
    await expect(page.locator('[data-testid="desktop-table"]')).toBeVisible()
  })
})
