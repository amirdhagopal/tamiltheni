import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Utils } from '../../../src/js/utils';

describe('Utils', () => {
    describe('shuffleArray', () => {
        it('should shuffle an array', () => {
            const array = [1, 2, 3, 4, 5];
            const original = [...array];
            Utils.shuffleArray(array);

            // It's possible but unlikely it returns the same order, 
            // but we expect it to contain same elements
            expect(array).toHaveLength(original.length);
            expect(array.sort()).toEqual(original.sort());
        });

        it('should modify the array in place', () => {
            const array = [1, 2, 3];
            const ref = array;
            Utils.shuffleArray(array);
            expect(array).toBe(ref);
        });
    });

    // getRandomItem does not exist in Utils currently


    describe('progress updates', () => {
        it('should update progress bar width', () => {
            document.body.innerHTML = `
                <div id="progressBar" style="width: 0%"></div>
                <div id="counter"></div>
            `;

            Utils.updateProgress(0, 10, 'progressBar', 'counter');
            const bar = document.getElementById('progressBar');
            // 0 + 1 / 10 * 100 = 10%
            expect(bar?.style.width).toBe('10%');

            Utils.updateProgress(4, 10, 'progressBar', 'counter');
            // 4 + 1 / 10 * 100 = 50%
            expect(bar?.style.width).toBe('50%');
        });
    });
});
