import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { init } from '../../src/js/theni1';
import { Layout } from '../../src/js/layout';

// Mock explicit dependencies that might affect DOM or Audio
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

            // Create slides-wrapper which is expected by generateSlides
            const wrapper = document.createElement('div');
            wrapper.id = 'slides-wrapper';
            document.body.appendChild(wrapper);
        }),
    },
}));

vi.mock('../../src/js/timer', () => ({
    Timer: {
        init: vi.fn(),
        toggleVisibility: vi.fn(),
        restart: vi.fn(),
        pause: vi.fn(),
    },
}));

vi.mock('../../src/js/audio_manager', () => ({
    AudioManager: {
        speak: vi.fn(),
    },
}));

describe('Theni 1 BAT', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should initialize layout and generate slides on init', () => {
        init();

        expect(Layout.init).toHaveBeenCalled();
        expect(document.getElementById('slides-wrapper')).toBeTruthy();
        expect(document.getElementById('filterD1')).toBeTruthy();

        // Check if slides are generated (assuming mock data or imported data works)
        // Since we are running in JSDOM, theniWords import should work if setup correctly.
        // We'll check if at least one slide exists.
        const slides = document.querySelectorAll('.slide');
        expect(slides.length).toBeGreaterThan(0);
    });

    it('should filter slides when D1 is clicked', () => {
        init();
        const d1Btn = document.getElementById('filterD1') as HTMLButtonElement;
        d1Btn.click();

        const progressInfo = document.getElementById('progressInfo');
        expect(progressInfo?.textContent).toContain('D1');
    });

    it('should navigate to next slide', () => {
        init();
        // Assuming slide 0 starts active
        const slides = document.querySelectorAll('.slide') as NodeListOf<HTMLElement>;
        if (slides.length > 1) {
            const nextBtn = document.getElementById('nextBtn') as HTMLButtonElement;
            nextBtn.click();

            // First click reveals (if hidden) or moves?
            // In Theni 1, click next moves if refined/revealed logic isn't blocking.
            // Logic: if class 'revealed' present -> move. else -> add 'revealed'.
            // Initially not revealed.

            // First click -> reveal
            expect(slides[0].classList.contains('revealed')).toBe(true);
            expect(slides[0].style.display).toBe('flex');

            // Advance time to bypass debounce
            vi.advanceTimersByTime(350);

            // Second click -> move
            nextBtn.click();
            expect(slides[1].style.display).toBe('flex');
        }
    });
});
