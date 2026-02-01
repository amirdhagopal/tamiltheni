import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { init } from '../../src/js/theni2';
import { Layout } from '../../src/js/layout';

// Mock explicit dependencies that might affect DOM or Audio
vi.mock('../../src/js/layout', () => ({
    Layout: {
        init: vi.fn((config) => {
            document.body.innerHTML = `
                <div id="controlContent"></div>
                <div class="slide-container">
                    <div id="slides-wrapper">
                         <div id="app-root"></div>
                    </div>
                </div>
            `;
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
        }),
    },
}));

vi.mock('../../src/js/timer', () => ({
    Timer: {
        init: vi.fn(),
        toggleVisibility: vi.fn(),
        restart: vi.fn(),
        pause: vi.fn(),
        setDuration: vi.fn(),
    },
}));

vi.mock('../../src/js/audio_manager', () => ({
    AudioManager: {
        speak: vi.fn(),
    },
}));

const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value.toString();
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Theni 2 BAT', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        vi.clearAllMocks();
        localStorageMock.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const waitForRender = async () => {
        // Advance timers to allow setTimeout(...,0) to fire
        await vi.advanceTimersByTimeAsync(100);
    };

    it('should initialize layout and dual cards', async () => {
        init();
        await waitForRender();
        expect(Layout.init).toHaveBeenCalled();
        expect(document.getElementById('card1')).toBeTruthy();
        expect(document.getElementById('card2')).toBeTruthy();
        expect(document.getElementById('apiKeyInput')).toBeTruthy();
    });

    it('should filter slides', async () => {
        init();
        await waitForRender();
        // Trigger D1 filter
        const d1Btn = document.getElementById('filterD1') as HTMLButtonElement;
        expect(d1Btn).toBeTruthy();
        d1Btn.click();
        await waitForRender();

        const info = document.getElementById('progressInfo');
        expect(info?.textContent).toContain('D1');
    });

    it('should handle navigation with card reveal logic', async () => {
        init();
        await waitForRender();
        const nextBtn = document.getElementById('nextBtn') as HTMLButtonElement;

        // Wait for nextBtn to be bound (Ref/Effect is usually fast but good to wait)
        expect(nextBtn).toBeTruthy();

        // Need to refetch cards as they might be re-rendered
        let card1 = document.getElementById('card1')!;
        let card2 = document.getElementById('card2')!;

        // Initial state: not revealed
        expect(card1.classList.contains('revealed')).toBe(false);

        // First click: Reveal both cards
        nextBtn.click();
        await waitForRender();

        card1 = document.getElementById('card1')!;
        card2 = document.getElementById('card2')!;

        expect(card1.classList.contains('revealed')).toBe(true);
        expect(card2.classList.contains('revealed')).toBe(true);

        // Mock that we are on slide 0
        // Second click: Move to next slide (reset reveal)
        // Since we mocked data, we assume at least 2 slides exist
        vi.advanceTimersByTime(350);
        nextBtn.click();
        await waitForRender();

        card1 = document.getElementById('card1')!;
        // After move, logic calls updateUI -> removes 'revealed'
        expect(card1.classList.contains('revealed')).toBe(false);
    });
});
