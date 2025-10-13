/**
 * E2E Tests: Complete CRUD Flow
 * Tests the full create, read, update, delete lifecycle
 */

import { test, expect } from '@playwright/test'

test.describe('CRUD Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the users page
    await page.goto('/users')
  })

  test('complete CRUD flow - create, read, update, delete user', async ({ page }) => {
    // CREATE: Click create button and fill in form
    await page.click('text=Create User')
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="email"]', 'john.doe@example.com')
    await page.fill('input[name="status"]', 'active')
    await page.click('button[type="submit"]')

    // Verify creation success message
    await expect(page.locator('text=User created successfully')).toBeVisible()

    // READ: Verify user appears in list
    await expect(page.locator('text=John Doe')).toBeVisible()
    await expect(page.locator('text=john.doe@example.com')).toBeVisible()

    // Click on user to view details
    await page.click('text=John Doe')
    await expect(page.locator('h1:has-text("John Doe")')).toBeVisible()

    // UPDATE: Click edit button and modify user
    await page.click('text=Edit')
    await page.fill('input[name="name"]', 'Jane Doe')
    await page.fill('input[name="email"]', 'jane.doe@example.com')
    await page.click('button[type="submit"]')

    // Verify update success message
    await expect(page.locator('text=User updated successfully')).toBeVisible()

    // Verify updated data is displayed
    await expect(page.locator('text=Jane Doe')).toBeVisible()
    await expect(page.locator('text=jane.doe@example.com')).toBeVisible()

    // DELETE: Click delete button
    await page.click('text=Delete')

    // Confirm deletion in dialog
    await page.click('button:has-text("Confirm")')

    // Verify delete success message
    await expect(page.locator('text=User deleted successfully')).toBeVisible()

    // Verify user is no longer in list
    await expect(page.locator('text=Jane Doe')).not.toBeVisible()
  })

  test('create user with validation errors', async ({ page }) => {
    // Click create button
    await page.click('text=Create User')

    // Try to submit empty form
    await page.click('button[type="submit"]')

    // Verify validation errors
    await expect(page.locator('text=Name is required')).toBeVisible()
    await expect(page.locator('text=Email is required')).toBeVisible()

    // Fill in invalid email
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', 'invalid-email')
    await page.click('button[type="submit"]')

    // Verify email validation error
    await expect(page.locator('text=Invalid email format')).toBeVisible()
  })

  test('update user with validation errors', async ({ page }) => {
    // Click on first user
    await page.click('[data-testid="user-row"]:first-child')

    // Click edit button
    await page.click('text=Edit')

    // Clear required field
    await page.fill('input[name="name"]', '')
    await page.click('button[type="submit"]')

    // Verify validation error
    await expect(page.locator('text=Name is required')).toBeVisible()
  })

  test('cancel delete operation', async ({ page }) => {
    // Click on first user
    await page.click('[data-testid="user-row"]:first-child')

    // Get user name for verification
    const userName = await page.locator('h1').textContent()

    // Click delete button
    await page.click('text=Delete')

    // Cancel in dialog
    await page.click('button:has-text("Cancel")')

    // Verify user is still visible
    await expect(page.locator(`text=${userName}`)).toBeVisible()
  })

  test('handle server errors gracefully', async ({ page }) => {
    // Intercept API request and return error
    await page.route('**/users', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      })
    })

    // Click create button and submit form
    await page.click('text=Create User')
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.click('button[type="submit"]')

    // Verify error message is displayed
    await expect(page.locator('text=Failed to create user')).toBeVisible()
  })
})
