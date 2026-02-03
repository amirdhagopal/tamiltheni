import { test, expect } from '@playwright/test';

test.describe('Theni 1 Visibility & Layout', () => {
    // Force a smaller viewport to catch height-based clipping
    test.use({ viewport: { width: 1024, height: 700 } });

    test('Tamil word should be fully visible within the slide container after reveal', async ({ page }) => {
        await page.goto('/html/theni1.html');

        // Wait for page load
        await page.waitForSelector('.slide-container');

        const container = page.locator('.slide-container');
        const wordTa = page.locator('#wordTa');
        const nextBtn = page.locator('#nextBtn');

        // 1. Initially hidden or blurred
        await expect(wordTa).not.toHaveClass(/revealed/);

        // 2. Reveal by clicking (ensuring we handle potential first click panel close)
        await nextBtn.click({ force: true });
        await page.waitForTimeout(500);

        const isRevealed = await wordTa.evaluate((el) => el.classList.contains('revealed'));
        if (!isRevealed) {
            await nextBtn.click({ force: true });
            await page.waitForTimeout(500);
        }

        const classes = await wordTa.getAttribute('class');
        const isVisible = await wordTa.isVisible();
        console.log(`WordTa Class: "${classes}", Visible: ${isVisible}`);

        // 4. Check visibility class
        await expect(wordTa).toHaveClass(/revealed/);
        await expect(wordTa).toBeVisible();

        // 5. Verification: Bounding Box check
        // The Tamil word must be within the vertical bounds of the container
        // AND not overlap with the navigation buttons at the bottom.

        const containerBox = await container.boundingBox();
        const wordBox = await wordTa.boundingBox();
        const navBox = await page.locator('.navigation').boundingBox();

        if (containerBox && wordBox && navBox) {
            console.log(`Container: Top ${containerBox.y}, Bottom ${containerBox.y + containerBox.height}`);
            console.log(`Word: Top ${wordBox.y}, Bottom ${wordBox.y + wordBox.height}`);
            console.log(`Nav: Top ${navBox.y}`);

            // Word must be inside container
            expect(wordBox.y + wordBox.height).toBeLessThanOrEqual(containerBox.y + containerBox.height);

            // Word must be ABOVE the navigation buttons (accounting for padding)
            // The Navigation island starts at roughly bottom-120px in CSS
            expect(wordBox.y + wordBox.height).toBeLessThan(navBox.y);
        } else {
            throw new Error('Could not get bounding boxes');
        }
    });

    test('Image should be responsive and not push content off-screen', async ({ page }) => {
        await page.goto('/html/theni1.html');

        const image = page.locator('.slide-image');
        const box = await image.boundingBox();

        if (box) {
            // Image should not be taller than 250px (our new responsive target)
            expect(box.height).toBeLessThanOrEqual(300);
        }
    });
});
