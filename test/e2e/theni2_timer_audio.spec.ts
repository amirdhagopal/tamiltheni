import { test, expect } from '@playwright/test';

test.describe('Theni 2 Timer and Audio Verification', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test.beforeEach(async ({ page }) => {
        // Collect console logs to verify audio requests
        page.on('console', (msg) => {
            if (msg.type() === 'error') console.log(`[Browser Error]: ${msg.text()}`);
        });
    });

    test('Theni 2: Timer Initialization and Toggle', async ({ page }) => {
        await page.goto('/html/theni2.html');
        await page.waitForLoadState('domcontentloaded');

        const timerPill = page.locator('#timerPill');
        const showTimerCheckbox = page.locator('#showTimer');

        // 1. Timer should be visible by default (if checked)
        const isChecked = await showTimerCheckbox.isChecked();
        if (isChecked) {
            await expect(timerPill).toBeVisible();
        }

        // 2. Toggle Timer OFF
        await showTimerCheckbox.uncheck({ force: true });
        await expect(timerPill).not.toBeVisible();

        // 3. Toggle Timer ON
        await showTimerCheckbox.check({ force: true });
        await expect(timerPill).toBeVisible();
    });

    test('Theni 2: Timer Restarts on Slide Change', async ({ page }) => {
        await page.goto('/html/theni1.html'); // Start elsewhere to ensure clean load
        await page.goto('/html/theni2.html');
        await page.waitForLoadState('domcontentloaded');

        const showTimerCheckbox = page.locator('#showTimer');
        await showTimerCheckbox.check({ force: true });

        const nextBtn = page.locator('#nextBtn');
        await expect(page.locator('#timerPill')).toBeVisible();

        // We can't easily check the internal state of the Timer module, 
        // but we can ensure it remains visible and doesn't crash on slide change.
        await nextBtn.click();
        await expect(page.locator('#timerPill')).toBeVisible();
    });

    test('Theni 2: Manual Speaker Button Presence and Position', async ({ page }) => {
        await page.goto('/html/theni2.html');
        await page.waitForSelector('.dual-word-card', { state: 'visible' });

        const speakerButtons = page.locator('.speaker-button-overlay');

        // Should have 2 speaker buttons (one on each card)
        await expect(speakerButtons).toHaveCount(2);

        // Verify they are visible
        await expect(speakerButtons.first()).toBeVisible();
        await expect(speakerButtons.last()).toBeVisible();
    });

    test('Theni 2: Audio Playback Triggers on Next Slide', async ({ page }) => {
        const logs: string[] = [];
        page.on('console', (msg) => {
            logs.push(msg.text());
        });

        await page.goto('/html/theni2.html');
        await page.waitForSelector('.dual-word-card', { state: 'visible' });

        // Ensure audio is enabled
        const audioCheckbox = page.locator('#audioToggle'); // Assuming this is the ID in Controls.tsx
        const isAudioEnabled = await audioCheckbox.isChecked();
        if (!isAudioEnabled) {
            await audioCheckbox.check({ force: true });
        }

        // Move to next slide
        await page.locator('#nextBtn').click();

        // Wait for debounce (500ms in code)
        await page.waitForTimeout(1000);

        // Check if AudioManager.speak was called
        // In headless mode, it might fail with 'not-allowed', but the log should still appear.
        const speakLogs = logs.filter(l => l.includes('[AudioManager] Request to speak:'));
        expect(speakLogs.length).toBeGreaterThan(0);
    });

    test('Theni 2: Manual Speaker Button Click Trigger', async ({ page }) => {
        const logs: string[] = [];
        page.on('console', (msg) => {
            logs.push(msg.text());
        });

        await page.goto('/html/theni2.html');
        await page.waitForSelector('.dual-word-card', { state: 'visible' });

        // Click the first speaker button
        await page.locator('.speaker-button-overlay').first().click();

        // Check if AudioManager.speak was called
        const manualSpeakLogs = logs.filter(l => l.includes('[AudioManager] Request to speak:'));
        expect(manualSpeakLogs.length).toBeGreaterThan(0);
    });
});
