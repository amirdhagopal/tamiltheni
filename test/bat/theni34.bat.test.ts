import { describe, it, expect, beforeEach, vi } from 'vitest';
import { init } from '../../src/js/theni34';
import { Layout } from '../../src/js/layout';
import { Timer } from '../../src/js/timer';

vi.mock('../../src/js/layout', () => ({
    Layout: {
        init: vi.fn((config) => {
            document.body.innerHTML = config.contentHTML;
            // Needed buttons
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
            // Wrapper
            const wrapper = document.createElement('div');
            wrapper.id = 'slides-wrapper';
            document.body.appendChild(wrapper);
        })
    }
}));

// We need to spy on Timer.init to verify the duration passed
vi.mock('../../src/js/timer', () => ({
    Timer: {
        init: vi.fn(),
        toggleVisibility: vi.fn(),
        restart: vi.fn(),
        pause: vi.fn(),
        setDuration: vi.fn() // Only used in Theni 5? Maybe used internally? Theni 34 uses Timer.init(duration) or setDuration?
        // In Theni 34 script: `Timer.init(15)` and `Timer.setDuration(40)` if switching or re-init?
        // Let's check logic: setTheniLevel calls Timer.init or config?
    }
}));

vi.mock('../../src/js/audio_manager', () => ({
    AudioManager: {
        speak: vi.fn()
    }
}));

describe('Theni 3 & 4 BAT', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        vi.clearAllMocks();
    });

    it('should initialize to Theni 3 with 15s timer by default', () => {
        init();
        expect(Layout.init).toHaveBeenCalled();

        // According to theni34.ts logic: "Default to Level 3" -> "setTheniLevel(3)"
        // Verify Timer.init was called with 15
        expect(Timer.init).toHaveBeenCalledWith(15);

        const l3Btn = document.getElementById('level3');
        expect(l3Btn?.classList.contains('active')).toBe(true);
    });

    it('should switch to Theni 4 and set timer to 40s', () => {
        init();

        // This clears the initial init(15) call expectation potentially, 
        // but we are checking subsequent calls.

        // Click Level 4
        const l4Btn = document.getElementById('level4') as HTMLButtonElement;
        l4Btn.click();

        // Verify UI update
        expect(l4Btn.classList.contains('active')).toBe(true);
        expect(document.getElementById('level3')?.classList.contains('active')).toBe(false);

        // Verify Timer duration update
        // Logic calls Timer.setDuration(40)
        expect(Timer.setDuration).toHaveBeenCalledWith(40);

        // And label update (optional but good UI check)
        const timerLabel = document.getElementById('timerLabel');
        expect(timerLabel?.textContent).toContain('40s');
    });

    it('should switch back to Theni 3 and set timer to 15s', () => {
        init();

        const l4Btn = document.getElementById('level4') as HTMLButtonElement;
        l4Btn.click();
        expect(Timer.setDuration).toHaveBeenCalledWith(40);

        const l3Btn = document.getElementById('level3') as HTMLButtonElement;
        l3Btn.click();
        expect(Timer.setDuration).toHaveBeenCalledWith(15);

        const timerLabel = document.getElementById('timerLabel');
        expect(timerLabel?.textContent).toContain('15s');
    });
});
