import { test, expect } from '@playwright/test';

test.describe('TamilTheni E2E Navigation', () => {
    test('should navigate from home to Theni 2 and interact', async ({ page }) => {
        // 1. Load Home
        await page.goto('/');
        await expect(page).toHaveTitle(/TamilTheni/);

        // 2. Click Theni 2 Link
        await page.locator('a[href="html/theni2.html"]').click();

        // 3. Verify Theni 2 Loaded
        const card = page.locator('.dual-word-card').first();
        await expect(card).toBeVisible();

        // 4. Reveal Word
        const slideContainer = page.locator('.slide-container');
        // Wait to ensuring page is stable
        await page.waitForTimeout(500);

        // Initial click closes the settings panel (which is open by default)
        await slideContainer.click();

        // Wait for panel transition/state update
        await page.waitForTimeout(300);

        // Second click reveals the word
        await slideContainer.click();

        // Verify "revealed" class
        await expect(page.locator('.dual-word-card.revealed').first()).toBeVisible();

        // 5. Next Slide
        // Click again to go to next slide
        await page.waitForTimeout(500);
        await slideContainer.click();

        // Verify content remains visible (checking stability)
        await expect(page.locator('.dual-word-card').first()).toBeVisible();
    });
});
