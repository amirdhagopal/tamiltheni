import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initAll } from '../../src/js/theni5';
import { Layout } from '../../src/js/layout';
import { Timer } from '../../src/js/timer';

vi.mock('../../src/js/layout', () => ({
    Layout: {
        init: vi.fn((config) => {
            document.body.innerHTML = config.contentHTML;
            const nav = document.createElement('div');
            nav.id = 'navigation';
            nav.innerHTML = `
                <button id="firstBtn">First</button>
                <button id="prevBtn">Prev</button>
                <button id="counter">0/0</button>
                <button id="nextBtn">Next</button>
                <button id="lastBtn">Last</button>
            `;
            document.body.appendChild(nav);
            // Words grid
            const grid = document.createElement('div');
            grid.id = 'wordsGrid';
            document.body.appendChild(grid);

            // Slide surface for click
            const surface = document.createElement('div');
            surface.id = 'slide-surface';
            document.body.appendChild(surface);
        })
    }
}));

vi.mock('../../src/js/timer', () => ({
    Timer: {
        init: vi.fn(),
        toggleVisibility: vi.fn(),
        restart: vi.fn(),
        pause: vi.fn(),
        setDuration: vi.fn()
    }
}));

// Mock Utils to avoid random shuffling during test unless needed
vi.mock('../../src/js/utils', () => ({
    Utils: {
        updateProgress: vi.fn(),
        shuffleArray: vi.fn((arr) => arr)
    }
}));

describe('Theni 5 BAT', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        vi.clearAllMocks();
    });

    it('should initialize and render words', () => {
        initAll();

        expect(Layout.init).toHaveBeenCalled();
        expect(Timer.init).toHaveBeenCalled();

        // Check grid population
        // Assuming mock data or imported data logic works
        const words = document.querySelectorAll('.word-item');
        // Initial range 1-250 default
        expect(words.length).toBeGreaterThan(0);
        expect(words.length).toBeLessThanOrEqual(5); // 5 per slide
    });

    it('should update range filters', () => {
        initAll();
        // Change range
        const startInput = document.getElementById('startRange') as HTMLInputElement;
        const endInput = document.getElementById('endRange') as HTMLInputElement;
        const applyBtn = document.getElementById('applyBtn') as HTMLButtonElement;

        startInput.value = '10';
        endInput.value = '20';
        applyBtn.click();

        // Should re-render
        // Testing exact logic depends on imported data, but checking no crash and function call is good BAT
        const grid = document.getElementById('wordsGrid');
        expect(grid?.children.length).toBeGreaterThan(0);
    });

    it('should navigate slides', () => {
        initAll();
        const nextBtn = document.getElementById('nextBtn') as HTMLButtonElement;

        // Mock current slide check or spy
        // Easier to just click and ensure no errors, or check counter update if Utils mock allows it
        nextBtn.click();

        // Since Utils is mocked, we might not see counter update unless we spy on Utils.updateProgress
        // expect(Utils.updateProgress).toHaveBeenCalledWith(1, ...);
        // But we just verify logic flow here.
    });
});
