import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Timer } from '../../../src/js/timer';

describe('Timer', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        // Mock Audio
        global.Audio = vi.fn().mockImplementation(() => ({
            play: vi.fn(),
            pause: vi.fn(),
            currentTime: 0
        }));
    });

    afterEach(() => {
        vi.restoreAllMocks();
        Timer.pause();
    });

    it('should initialize with duration', () => {
        Timer.init(10);
        expect(Timer.duration).toBe(10);
    });

    it('should update duration', () => {
        Timer.setDuration(20);
        expect(Timer.duration).toBe(20);
    });

    it('should start and decrement', () => {
        Timer.init(10);
        // Start via toggle (timeLeft > 0)
        Timer.toggle();

        vi.advanceTimersByTime(1000);
        // timeLeft should be 9
        expect(Timer.timeLeft).toBe(9);
    });

    // Since Timer is a singleton and heavily DOM/Audio coupled, 
    // we might need to mock DOM elements or refactor Timer to be more testable.
    // For now, basic state checks.
});
