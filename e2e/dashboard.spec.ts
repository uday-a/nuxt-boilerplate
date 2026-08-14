import { test, expect } from '@playwright/test'

test.describe('Dashboard and internal views (Nuxt)', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure clean session before logging in
    await page.goto('/auth/logout')
    await page.waitForURL('**/login')
    await page.waitForLoadState('networkidle')
    const demoBtn = page.getByRole('button', { name: 'Continue as demo user' })
    await expect(demoBtn).toBeVisible()
    await demoBtn.click()
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 })
  })

  test('dashboard renders KPI metrics and charts', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible()
    await expect(page.getByText('MRR', { exact: true })).toBeVisible()
    await expect(page.getByText('Active users', { exact: true })).toBeVisible()
  })

  test('navigates to data table and filters customers', async ({ page }) => {
    await page.goto('/dashboard/data-table')
    await expect(page.getByRole('heading', { name: 'Customers' })).toBeVisible()

    const searchInput = page.getByPlaceholder('Search name, email, country…')
    await expect(searchInput).toBeVisible()

    // Type in search
    await searchInput.fill('Northwind')
    await expect(page.getByText('Northwind Industries')).toBeVisible()
  })

  test('navigates to kanban board and displays columns', async ({ page }) => {
    await page.goto('/dashboard/kanban')
    await expect(page.getByText('Backlog')).toBeVisible()
    await expect(page.getByText('In Progress')).toBeVisible()
    await expect(page.getByText('Done')).toBeVisible()
  })
})
