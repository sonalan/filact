/**
 * E2E Tests: Search and Filter
 * Tests search functionality and filtering capabilities
 */

import { test, expect } from '@playwright/test'

test.describe('Search and Filter', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the users page
    await page.goto('/users')
  })

  test('search for users by name', async ({ page }) => {
    // Type in search box
    await page.fill('input[placeholder*="Search"]', 'Alice')

    // Wait for results to update
    await page.waitForTimeout(500) // Debounce delay

    // Verify only matching users are shown
    await expect(page.locator('text=Alice Smith')).toBeVisible()
    await expect(page.locator('text=Bob Johnson')).not.toBeVisible()
    await expect(page.locator('text=Charlie Brown')).not.toBeVisible()
  })

  test('search for users by email', async ({ page }) => {
    // Type in search box
    await page.fill('input[placeholder*="Search"]', 'bob@example.com')

    // Wait for results to update
    await page.waitForTimeout(500)

    // Verify only matching users are shown
    await expect(page.locator('text=Bob Johnson')).toBeVisible()
    await expect(page.locator('text=Alice Smith')).not.toBeVisible()
  })

  test('clear search shows all results', async ({ page }) => {
    // Type in search box
    await page.fill('input[placeholder*="Search"]', 'Alice')
    await page.waitForTimeout(500)

    // Clear search
    await page.fill('input[placeholder*="Search"]', '')
    await page.waitForTimeout(500)

    // Verify all users are shown
    await expect(page.locator('text=Alice Smith')).toBeVisible()
    await expect(page.locator('text=Bob Johnson')).toBeVisible()
    await expect(page.locator('text=Charlie Brown')).toBeVisible()
  })

  test('filter users by status', async ({ page }) => {
    // Open filter dropdown
    await page.click('button:has-text("Filter")')

    // Select "Active" status
    await page.click('text=Active')

    // Verify only active users are shown
    await expect(page.locator('text=Alice Smith')).toBeVisible()
    await expect(page.locator('text=Bob Johnson')).toBeVisible()
    await expect(page.locator('text=Charlie Brown')).not.toBeVisible()
  })

  test('filter users by multiple criteria', async ({ page }) => {
    // Open filter dropdown
    await page.click('button:has-text("Filter")')

    // Select status filter
    await page.click('text=Active')

    // Also apply search
    await page.fill('input[placeholder*="Search"]', 'Alice')
    await page.waitForTimeout(500)

    // Verify only users matching both criteria are shown
    await expect(page.locator('text=Alice Smith')).toBeVisible()
    await expect(page.locator('text=Bob Johnson')).not.toBeVisible()
    await expect(page.locator('text=Charlie Brown')).not.toBeVisible()
  })

  test('clear all filters', async ({ page }) => {
    // Apply search
    await page.fill('input[placeholder*="Search"]', 'Alice')
    await page.waitForTimeout(500)

    // Apply status filter
    await page.click('button:has-text("Filter")')
    await page.click('text=Active')

    // Click clear filters button
    await page.click('button:has-text("Clear Filters")')

    // Verify all users are shown
    await expect(page.locator('text=Alice Smith')).toBeVisible()
    await expect(page.locator('text=Bob Johnson')).toBeVisible()
    await expect(page.locator('text=Charlie Brown')).toBeVisible()
  })

  test('show "no results" message when no matches', async ({ page }) => {
    // Search for non-existent user
    await page.fill('input[placeholder*="Search"]', 'NonExistentUser123')
    await page.waitForTimeout(500)

    // Verify no results message
    await expect(page.locator('text=No users found')).toBeVisible()
  })

  test('pagination works with search', async ({ page }) => {
    // Clear any existing search
    await page.fill('input[placeholder*="Search"]', '')

    // Verify pagination controls are visible
    await expect(page.locator('button:has-text("Next")')).toBeVisible()
    await expect(page.locator('button:has-text("Previous")')).toBeVisible()

    // Apply search that returns results
    await page.fill('input[placeholder*="Search"]', 'example.com')
    await page.waitForTimeout(500)

    // Pagination should still work
    await expect(page.locator('text=Page 1')).toBeVisible()
  })

  test('sorting works with filters', async ({ page }) => {
    // Apply filter
    await page.click('button:has-text("Filter")')
    await page.click('text=Active')

    // Click sort by name
    await page.click('th:has-text("Name")')

    // Verify results are sorted and filtered
    const firstUser = page.locator('[data-testid="user-row"]').first()
    await expect(firstUser).toContainText('Alice Smith')
  })

  test('filters persist when navigating back', async ({ page }) => {
    // Apply search
    await page.fill('input[placeholder*="Search"]', 'Alice')
    await page.waitForTimeout(500)

    // Click on a user
    await page.click('text=Alice Smith')

    // Go back
    await page.goBack()

    // Verify search is still applied
    const searchInput = page.locator('input[placeholder*="Search"]')
    await expect(searchInput).toHaveValue('Alice')
  })

  test('handle long search queries', async ({ page }) => {
    // Type a very long search query
    const longQuery = 'a'.repeat(100)
    await page.fill('input[placeholder*="Search"]', longQuery)
    await page.waitForTimeout(500)

    // Verify app doesn't crash and shows no results
    await expect(page.locator('text=No users found')).toBeVisible()
  })

  test('special characters in search', async ({ page }) => {
    // Type special characters
    await page.fill('input[placeholder*="Search"]', '@#$%^&*()')
    await page.waitForTimeout(500)

    // Verify app handles it gracefully
    await expect(page.locator('text=No users found')).toBeVisible()
  })
})
