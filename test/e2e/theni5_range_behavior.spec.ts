import { test, expect } from '@playwright/test';

test.describe('Theni 5 Range and Panel Behavior', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test('Theni 5: Range 1-10 should result in exactly 2 pages', async ({ page }) => {
        await page.goto('/html/theni5.html');
        await page.waitForLoadState('domcontentloaded');

        const panel = page.locator('#controlPanel');
        await expect(panel).toHaveClass(/open/);

        // Set range 1-10
        const startInput = page.locator('#startRange');
        const endInput = page.locator('#endRange');
        const applyBtn = page.locator('button:has-text("Apply")');

        await startInput.fill('1');
        await endInput.fill('10');
        await applyBtn.click();

        // Wait for state update
        await page.waitForTimeout(500);

        // Counter should show "1 / 2"
        const counter = page.locator('#counter');
        await expect(counter).toHaveText('1 / 2');

        // Progress info
        const progressInfo = page.locator('.progress-info');
        await expect(progressInfo).toContainText('10 words in range');
    });

    test('Theni 5: Panel should NOT collapse when typing numbers, but SHOULD on slide click', async ({ page }) => {
        await page.goto('/html/theni5.html');
        await page.waitForLoadState('domcontentloaded');

        const panel = page.locator('#controlPanel');
        await expect(panel).toHaveClass(/open/);

        const startInput = page.locator('#startRange');

        // 1. Hover and click input - panel should stay open
        await startInput.click();
        await expect(panel).toHaveClass(/open/);

        // 2. Type in input - panel should stay open
        await startInput.fill('5');
        await expect(panel).toHaveClass(/open/);

        // 3. Click "Apply" - panel should stay open (or specifically NOT collapse due to the change)
        const applyBtn = page.locator('button:has-text("Apply")');
        await applyBtn.click();
        await expect(panel).toHaveClass(/open/);

        // 4. Click on a word card (outside panel) - panel SHOULD collapse
        // Explicitly click a word card to avoid triggering 'next page' on empty space
        await page.locator('.word-row-card').first().click();
        await expect(panel).not.toHaveClass(/open/);
    });

    test('Theni 5: Navigation buttons should collapse panel', async ({ page }) => {
        await page.goto('/html/theni5.html');
        await page.waitForLoadState('domcontentloaded');

        const panel = page.locator('#controlPanel');
        await expect(panel).toHaveClass(/open/);

        // Click next button
        const nextBtn = page.locator('#nextBtn');
        await nextBtn.click();

        await expect(panel).not.toHaveClass(/open/);
    });

    test('Theni 5: Jump to First/Last should work correctly', async ({ page }) => {
        await page.goto('/html/theni5.html');
        await page.waitForLoadState('domcontentloaded');

        // Set range 1-15 (3 pages)
        const startInput = page.locator('#startRange');
        const endInput = page.locator('#endRange');
        const applyBtn = page.locator('button:has-text("Apply")');

        await startInput.fill('1');
        await endInput.fill('15');
        await applyBtn.click();

        const counter = page.locator('#counter');
        await expect(counter).toHaveText('1 / 3');

        // Go to Last
        await page.locator('#lastBtn').click();
        await expect(counter).toHaveText('3 / 3');

        // Go to First
        await page.locator('#firstBtn').click();
        await expect(counter).toHaveText('1 / 3');
    });

    test('Theni 5: Keyboard shortcuts should respect page boundaries', async ({ page }) => {
        await page.goto('/html/theni5.html');
        await page.waitForLoadState('domcontentloaded');

        // Set range 1-10 (2 pages)
        const startInput = page.locator('#startRange');
        const endInput = page.locator('#endRange');
        const applyBtn = page.locator('button:has-text("Apply")');

        await startInput.fill('1');
        await endInput.fill('10');
        await applyBtn.click();
        // Click slide area to move focus away from button and onto the page
        await page.locator('.word-row-card').first().click();
        await page.waitForTimeout(300);

        const counter = page.locator('#counter');
        await expect(counter).toHaveText('1 / 2');

        // Press Space on Page 1 -> Go to Page 2
        await page.keyboard.press(' ');
        await page.waitForTimeout(300);
        await expect(counter).toHaveText('2 / 2');

        // Press Space on Last Page -> Stay on Page 2
        await page.keyboard.press(' ');
        await page.waitForTimeout(300);
        await expect(counter).toHaveText('2 / 2');

        // Press ArrowLeft -> Go to Page 1
        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(300);
        await expect(counter).toHaveText('1 / 2');

        // Press ArrowLeft on Page 1 -> Stay on Page 1
        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(300);
        await expect(counter).toHaveText('1 / 2');

        // Press ArrowRight on Page 1 -> Go to Page 2
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(300);
        await expect(counter).toHaveText('2 / 2');
    });
});
