import { test, expect } from '@playwright/test';

test.describe('TamilTheni UI Refinements E2E', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test.beforeEach(({ page }) => {
        page.on('console', (msg) => {
            if (msg.text().includes('ServiceWorker') || msg.text().includes('MIME type')) return;
            console.log(`[Browser ${msg.type().toUpperCase()}]: ${msg.text()}`);
        });
    });

    /**
     * FR-005.1: Settings Panel Auto-Collapse
     */
    test('FR-005.1: Settings Panel Auto-Collapse (Theni 1)', async ({ page }) => {
        await page.goto('/html/theni1.html');
        const panel = page.locator('#controlPanel');
        const toggle = page.locator('#settingsToggle');

        // 1. Panel starts open
        await expect(panel).toHaveClass(/open/);

        // 2. Click on the slide card area (bottom center) - (X, 780) is definitely below 80vh panel
        await page.mouse.click(640, 780);
        await expect(panel).not.toHaveClass(/open/);

        // 3. Toggle back open
        await toggle.click();
        await expect(panel).toHaveClass(/open/);

        // 4. Click navigation
        await page.locator('#nextBtn').click({ force: true });
        await expect(panel).not.toHaveClass(/open/);
    });

    /**
     * FR-005.2: Category Dropdown Auto-Close
     */
    test('FR-005.2: Category Dropdown Auto-Close (Theni 1)', async ({ page }) => {
        await page.goto('/html/theni1.html');

        const dropdownBtn = page.locator('#cat-dropdown-btn');
        const dropdownMenu = page.locator('#categoryMenu');

        await expect(page.locator('#controlPanel')).toHaveClass(/open/);

        // 1. Open dropdown
        await dropdownBtn.click({ force: true });
        await page.waitForSelector('#categoryMenu.show', { state: 'visible' });

        // 2. Click on another part of the settings panel (Reset button or label)
        await page.locator('.control-label:has-text("Progress:")').click();

        // 3. Verify dropdown closed
        await expect(dropdownMenu).not.toHaveClass(/show/);

        // 4. Re-open and click the Reset button
        await dropdownBtn.click({ force: true });
        await page.waitForSelector('#categoryMenu.show', { state: 'visible' });
        await page.locator('#appHeader').click();

        // Wait for state updates
        await page.waitForTimeout(500);
        await expect(dropdownMenu).not.toHaveClass(/show/);
    });

    /**
     * Standardized Navigation Bar
     */
    test('Standardized Navigation Presence (Across Modules)', async ({ page }) => {
        const modules = [
            '/html/theni1.html',
            '/html/theni1.html',
            '/html/theni2.html',
            '/html/theni34.html',
            '/html/theni5.html',
        ];

        for (const url of modules) {
            await test.step(`Checking ${url}`, async () => {
                await page.goto(url);
                await page.waitForLoadState('domcontentloaded');

                const nextBtn = page.locator('#nextBtn');
                await nextBtn.waitFor({ state: 'attached', timeout: 10000 });

                await expect(page.locator('#firstBtn')).toBeVisible();
                await expect(page.locator('#prevBtn')).toBeVisible();
                await expect(nextBtn).toBeVisible();
                await expect(page.locator('#lastBtn')).toBeVisible();
            });
        }
    });

    /**
     * Theni 2: Dual Word Cards & Randomized Selection
     */
    test('Theni 2: Dual Word Cards Integrity & Randomization', async ({ page }) => {
        await page.goto('/html/theni2.html');
        await page.waitForSelector('#card1En', { state: 'attached' });

        const card1En = page.locator('#card1En');
        const card2En = page.locator('#card2En');

        // Initial check
        const word1 = await card1En.innerText();
        const word2 = await card2En.innerText();
        expect(word1.trim()).not.toBe('');
        expect(word2.trim()).not.toBe('');
        expect(word1.trim()).not.toBe(word2.trim());

        // Shuffle
        await page.locator('button:has-text("Shuffle")').click({ force: true });
        await page.waitForTimeout(1000); // Wait for state update

        const word1New = await card1En.innerText();
        const word2New = await card2En.innerText();
        expect(word1New.trim()).not.toBe('');
        expect(word2New.trim()).not.toBe('');
        // partners should be random
        expect(word1New.trim()).not.toBe(word2New.trim());
    });

    /**
     * FR-001.1: Universal Click-to-Next
     */
    test('FR-001.1: Universal Click-to-Next (Theni 3 & 4)', async ({ page }) => {
        await page.goto('/html/theni34.html');
        await page.waitForSelector('.slide', { state: 'attached' });

        const container = page.locator('.slide-container');
        const counter = page.locator('#counter');

        // 1. Close panel
        await page.mouse.click(640, 750);
        await expect(page.locator('#controlPanel')).not.toHaveClass(/open/);

        // 2. Click to reveal
        await container.click({ position: { x: 450, y: 300 }, force: true });
        await page.waitForTimeout(500);

        // Find the active slide's word-ta
        const wordTa = page.locator('.slide.active .word-ta');
        await expect(wordTa).toHaveClass(/revealed/);

        // 3. Click to move next
        const startCount = await counter.innerText();
        await container.click({ position: { x: 300, y: 200 }, force: true });
        await page.waitForTimeout(500);

        // After next, the NEW slide's word-ta should NOT be revealed
        await expect(page.locator('.slide.active .word-ta')).not.toHaveClass(/revealed/);
        await expect(counter).not.toHaveText(startCount);
    });
});
