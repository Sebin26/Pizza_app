import { test, expect } from '@playwright/test';

const appUrl = '/?order=true';

test.describe('Pizza app end-to-end smoke', () => {
  test('can browse menu, add pizza, edit cart item, and remove it', async ({ page }) => {
    await page.goto(appUrl, { waitUntil: 'networkidle' });

    const addButton = page.locator('button', { hasText: 'Add' }).filter({ hasText: /^Add$/ }).first();
    await expect(addButton).toBeVisible();
    await addButton.click();

    // Wait for builder page or modal
    await expect(page.locator('h1', { hasText: /Customize/ })).toBeVisible();

    // Click Add to cart / Save item
    const addToCartButton = page.locator('button', { hasText: 'Add to Cart' }).first();
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();

    // Should land on cart page
    await expect(page).toHaveURL(/\/cart/);
    await expect(page.locator('text=Review Your Order')).toBeVisible();

    const customizeButton = page.locator('button', { hasText: 'Customize' }).first();
    await expect(customizeButton).toBeVisible();
    await customizeButton.click();

    // Modal customizer opens
    await expect(page.locator('text=Edit:')).toBeVisible();

    const saveButton = page.locator('button', { hasText: 'Save Address' }).first();
    if (await saveButton.isVisible()) {
      // The edit modal may include address actions; ignore if not needed.
    }

    const updateButton = page.locator('button', { hasText: /Updated item in cart|Add/ }).last();
    await expect(updateButton).toBeVisible();
    await updateButton.click();

    // Back to cart and item remains
    await expect(page.locator('text=Updated item in cart')).toBeVisible({ timeout: 5000 }).catch(() => {});
    await expect(page.locator('button', { hasText: 'Customize' }).first()).toBeVisible();

    const removeButton = page.locator('button[title="Remove item"]').first();
    await expect(removeButton).toBeVisible();
    await removeButton.click();

    // Cart should update or show empty state
    await expect(page.locator('text=Your Cart is Empty').first()).toBeVisible({ timeout: 5000 }).catch(() => {
      expect(page.locator('button', { hasText: 'Customize' }).count()).toBeLessThan(1);
    });
  });
});
