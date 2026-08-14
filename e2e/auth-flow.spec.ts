import { test, expect } from '@playwright/test'

test.describe('Authentication and demo user session (Nuxt)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/logout')
    await page.waitForURL('**/login')
  })

  test('sign-in page shows credentials form and demo login', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continue as demo user' })).toBeVisible()
  })

  test('clicking demo user logs in and redirects to dashboard', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    const demoBtn = page.getByRole('button', { name: 'Continue as demo user' })
    await expect(demoBtn).toBeVisible()
    await demoBtn.click()

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 })
    await expect(page.getByText('Demo User')).toBeVisible()
  })
})
