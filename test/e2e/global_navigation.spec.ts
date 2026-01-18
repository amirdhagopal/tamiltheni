import { test, expect } from '@playwright/test';

test.describe('TamilTheni E2E Suite', () => {
    test.beforeEach(({ page }) => {
        page.on('console', (msg) => console.log(`[Browser Console]: ${msg.text()}`));
        page.on('pageerror', (err) => console.log(`[Browser Error]: ${err.message}`));
    });

    test('Global Navigation: Should access all functionality from Home', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/TamilTheni/);

        // Verify all module links are present and visible
        await expect(page.locator('a[href="html/theni1.html"]')).toBeVisible();
        await expect(page.locator('a[href="html/theni2.html"]')).toBeVisible();
        await expect(page.locator('a[href="html/theni34.html"]')).toBeVisible();
        await expect(page.locator('a[href="html/theni5.html"]')).toBeVisible();
    });

    test('Theni 1: Image, English Word, Reveal, Next Slide', async ({ page }) => {
        await page.goto('/html/theni1.html');

        // 1. Verify Initial State (Slide 0)
        const slide0 = page.locator('#slide-0');
        await expect(slide0).toBeVisible();
        await expect(slide0).toHaveClass(/active/);

        // Check content exists (English visible)
        await expect(slide0.locator('.word-en')).toBeVisible();
        // Image should be loading/loaded
        await expect(slide0.locator('.slide-image')).toBeVisible();

        // 2. Handle Potential Panel/Initial Interaction
        // Initial click might close the panel if open.
        const wrapper = page.locator('#slides-wrapper');
        await wrapper.click();
        await page.waitForTimeout(300);

        // 3. Ensure Revealed
        // If the first click was consumed by panel closing, we might need another.
        // Check if 'revealed' class is present.
        const isRevealed = await slide0.evaluate((el) => el.classList.contains('revealed'));
        if (!isRevealed) {
            await wrapper.click();
        }

        // Verify Revealed State (Tamil word visible/unblurred)
        await expect(slide0).toHaveClass(/revealed/);

        // 4. Next Slide
        await wrapper.click();

        // Verify Slide 1 is now active
        const slide1 = page.locator('#slide-1');
        await expect(slide1).toHaveClass(/active/);
        await expect(slide1).toBeVisible();
    });

    test('Theni 2: Dual Images, Sentences, Reveal, Next Slide', async ({ page }) => {
        await page.goto('/html/theni2.html');

        // 1. Verify Initial State
        const card1 = page.locator('#card1');
        const card2 = page.locator('#card2');

        await expect(card1).toBeVisible();
        await expect(card2).toBeVisible();

        // Verify English words are visible
        await expect(page.locator('#card1En')).not.toBeEmpty();
        await expect(page.locator('#card2En')).not.toBeEmpty();

        // 2. Reveal
        const container = page.locator('.slide-container');
        await container.click();
        await page.waitForTimeout(500); // Wait for transition & debounce

        // Check for reveal (handling panel close if needed)
        const isRevealed = (await page.locator('.dual-word-card.revealed').count()) > 0;
        if (!isRevealed) {
            await container.click();
        }

        // Verify both cards are revealed
        await expect(page.locator('#card1')).toHaveClass(/revealed/);
        await expect(page.locator('#card2')).toHaveClass(/revealed/);

        // 3. Next Slide
        // Get current words to compare later (optional, but good for verification)
        const word1Text = await page.locator('#card1En').textContent();

        await page.waitForTimeout(500); // Ensure debounce is clear
        await container.click();
        await page.waitForTimeout(500); // Allow transition

        // Verify words changed
        const newWord1Text = await page.locator('#card1En').textContent();
        expect(newWord1Text).not.toBe(word1Text);
    });

    test('Theni 3 & 4: Sentence Reading, Reveal, Next Slide', async ({ page }) => {
        await page.goto('/html/theni34.html');

        // 1. Verify Initial State (Slide 0)
        const slide0 = page.locator('#slide-0');
        await expect(slide0).toBeVisible();
        await expect(slide0).toHaveClass(/active/);

        // Verify English Sentence visible
        await expect(slide0.locator('.word-en')).toBeVisible();

        // 2. Reveal Logic (Panel Interaction Check)
        // Panel starts open. First click should CLOSE panel and NOT reveal.
        const panel = page.locator('#controlPanel');
        await expect(panel).not.toHaveClass(/collapsed/);

        // First Click -> Should close panel
        await slide0.locator('.slide-content').click();
        await page.waitForTimeout(300);
        await expect(panel).toHaveClass(/collapsed/);
        await expect(slide0).not.toHaveClass(/revealed/); // Should NOT be revealed yet

        // Second Click -> Should Reveal
        await slide0.locator('.slide-content').click();
        await page.waitForTimeout(300);

        // Verify "revealed"
        await expect(slide0).toHaveClass(/revealed/);

        // 3. Next Slide
        await slide0.locator('.slide-content').click();

        const slide1 = page.locator('#slide-1');
        await expect(slide1).toHaveClass(/active/);
    });

    test('Theni 5: Word Grid, Navigation', async ({ page }) => {
        await page.goto('/html/theni5.html');

        // 1. Verify 5 words displayed
        await expect(page.locator('.word-item')).toHaveCount(5);

        // Capture first word
        const firstWord = await page.locator('.word-item').first().textContent();

        // 2. Next Set (Click Next Button)
        await page.locator('#nextBtn').click();
        await page.waitForTimeout(300);

        // 3. Verify new words
        await expect(page.locator('.word-item')).toHaveCount(5);
        const nextWord = await page.locator('.word-item').first().textContent();

        expect(nextWord).not.toBe(firstWord);
    });
});
