import { test, expect } from '@playwright/test'

test.describe('Landing page (Nuxt)', () => {
  test('renders hero title, navigation and trial CTAs', async ({ page }) => {
    await page.goto('/')

    // Hero title
    await expect(page.locator('h1')).toContainText('The platform your team will actually use')

    // Navigation links
    await expect(page.getByRole('banner').getByRole('link', { name: 'Sign in' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Start free trial' }).first()).toBeVisible()
  })

  test('pricing billing toggle updates monthly / yearly prices', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('$9')).toBeVisible()
    await expect(page.getByText('$29')).toBeVisible()

    // Switch to Yearly
    const yearlyBtn = page.getByRole('button', { name: /Yearly/i })
    await expect(yearlyBtn).toBeVisible()
    await yearlyBtn.click()

    await expect(page.getByText('$7')).toBeVisible()
  })

  test('FAQ accordion toggles question details', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const faqTrigger = page.getByRole('button', { name: 'How does the 14-day free trial work?' })
    await expect(faqTrigger).toBeVisible()
    await faqTrigger.click()
    await expect(page.getByText(/Sign up with a work email/i)).toBeVisible({ timeout: 10000 })
  })
})
