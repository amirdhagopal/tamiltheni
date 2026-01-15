import { describe, it, expect, beforeEach, vi } from 'vitest';
import { init as initTheni1 } from '../../src/js/theni1';
import { init as initTheni2 } from '../../src/js/theni2';
import { init as initTheni34 } from '../../src/js/theni34';
import { initAll as initTheni5 } from '../../src/js/theni5';
// Mock dependencies
vi.mock('../../src/js/layout', () => ({
    Layout: {
        init: vi.fn((config) => {
            document.body.innerHTML = config.contentHTML;
            // Manually inject buttons that Layout usually injects
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
            // Create slides-wrapper
            const wrapper = document.createElement('div');
            wrapper.id = 'slides-wrapper';
            document.body.appendChild(wrapper);
        }),
    },
}));

vi.mock('../../src/js/timer', () => ({
    Timer: { init: vi.fn(), toggleVisibility: vi.fn(), restart: vi.fn(), setDuration: vi.fn() },
}));

vi.mock('../../src/js/audio_manager', () => ({
    AudioManager: { speak: vi.fn() },
}));

describe('UI Interaction Tests', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        vi.clearAllMocks();

        // Mock localStorage
        const localStorageMock = (() => {
            let store: Record<string, string> = {};
            return {
                getItem: vi.fn((key: string) => store[key] || null),
                setItem: vi.fn((key: string, value: string) => {
                    store[key] = value.toString();
                }),
                clear: vi.fn(() => {
                    store = {};
                }),
                removeItem: vi.fn((key: string) => {
                    delete store[key];
                }),
            };
        })();
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true,
        });
    });

    describe('Theni 1 Button States', () => {
        it('should toggle active class on Difficulty Filter buttons', () => {
            initTheni1();
            const btnAll = document.getElementById('filterAll');
            const btnD1 = document.getElementById('filterD1');
            const btnD2 = document.getElementById('filterD2');

            // Default state
            expect(btnAll?.classList.contains('active')).toBe(true);
            expect(btnD1?.classList.contains('active')).toBe(false);

            // Click D1
            btnD1?.click();
            expect(btnAll?.classList.contains('active')).toBe(false);
            expect(btnD1?.classList.contains('active')).toBe(true);
            expect(btnD2?.classList.contains('active')).toBe(false);

            // Click D2
            btnD2?.click();
            expect(btnD1?.classList.contains('active')).toBe(false);
            expect(btnD2?.classList.contains('active')).toBe(true);
        });

        it('should toggle active class on Shuffle button', () => {
            initTheni1();
            const btnShuffle = document.getElementById('btn-shuffle');
            const btnReset = document.getElementById('btn-reset-seq');

            // Default state
            expect(btnShuffle?.classList.contains('active')).toBe(false);

            // Click Shuffle
            btnShuffle?.click();
            expect(btnShuffle?.classList.contains('active')).toBe(true);

            // Click Reset
            btnReset?.click();
            expect(btnShuffle?.classList.contains('active')).toBe(false);
        });
    });

    describe('Theni 2 Button States', () => {
        it('should toggle active class on Shuffle button', () => {
            initTheni2();
            const btnShuffle = document.getElementById('btn-shuffle');
            const btnReset = document.getElementById('btn-reset-seq');

            // Default state
            expect(btnShuffle?.classList.contains('active')).toBe(false);

            // Click Shuffle
            btnShuffle?.click();
            expect(btnShuffle?.classList.contains('active')).toBe(true);

            // Click Reset
            btnReset?.click();
            expect(btnShuffle?.classList.contains('active')).toBe(false);
        });
    });

    describe('Theni 3 & 4 Button States', () => {
        it('should toggle active class on Shuffle button', () => {
            initTheni34();
            const btnShuffle = document.getElementById('btn-shuffle');
            const btnReset = document.getElementById('btn-reset-seq');

            // Default state
            expect(btnShuffle?.classList.contains('active')).toBe(false);

            // Click Shuffle
            btnShuffle?.click();
            expect(btnShuffle?.classList.contains('active')).toBe(true);

            // Click Reset
            btnReset?.click();
            expect(btnShuffle?.classList.contains('active')).toBe(false);
        });
    });

    describe('Theni 5 Button States', () => {
        it('should toggle active class on Shuffle button', () => {
            initTheni5();
            const btnShuffle = document.getElementById('shuffleBtn');
            const btnReset = document.getElementById('resetBtn');

            // Default state
            expect(btnShuffle?.classList.contains('active')).toBe(false);

            // Click Shuffle
            btnShuffle?.click();
            expect(btnShuffle?.classList.contains('active')).toBe(true);

            // Click Reset
            btnReset?.click();
            expect(btnShuffle?.classList.contains('active')).toBe(false);
        });
    });
});
