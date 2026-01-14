/**
 * Shared Utilities for TamilTheni
 */
const TheniUtils = {
    /**
     * Fisher-Yates shuffle for arrays.
     * @param {Array} array 
     * @returns {Array} Shuffled array (in-place)
     */
    shuffleArray: function (array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    /**
     * Updates progress bar and text indicator.
     * @param {number} current 0-based index
     * @param {number} total Total value
     * @param {string} barId Element ID for progress bar
     * @param {string} textId Element ID for text indicator
     */
    updateProgress: function (current, total, barId = 'progressBar', textId = 'slideIndicator') {
        const safeTotal = total > 0 ? total : 1;
        const width = ((current + 1) / safeTotal) * 100;

        const bar = document.getElementById(barId);
        if (bar) bar.style.width = `${width}%`;

        const indicator = document.getElementById(textId);
        if (indicator) indicator.innerText = `${current + 1} / ${safeTotal}`;
    },

    saveLocal: (key, val) => localStorage.setItem(key, val),
    getLocal: (key) => localStorage.getItem(key)
};

window.TheniUtils = TheniUtils;
