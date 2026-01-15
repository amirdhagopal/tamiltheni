export const Utils = {
    /**
     * Fisher-Yates shuffle for arrays.
     */
    shuffleArray: function <T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    /**
     * Updates progress bar and text indicator.
     */
    updateProgress: function (current: number, total: number, barId = 'progressBar', textId = 'slideIndicator'): void {
        const safeTotal = total > 0 ? total : 1;
        const width = ((current + 1) / safeTotal) * 100;

        const bar = document.getElementById(barId);
        if (bar) bar.style.width = `${width}%`;

        const indicator = document.getElementById(textId);
        if (indicator) indicator.innerText = `${current + 1} / ${safeTotal}`;
    },

    saveLocal: (key: string, val: string): void => localStorage.setItem(key, val),
    getLocal: (key: string): string | null => localStorage.getItem(key),

    /**
     * Sanitizes a word for use as a filename.
     */
    getSafeFilename: function (word: string): string {
        if (!word) return '';
        return word
            .replace(/[^a-zA-Z0-9 \-_]/g, '')
            .trim()
            .replace(/\s+/g, '_')
            .toLowerCase();
    },

    /**
     * Returns the correct path for an image, accounting for subdirectory depth.
     */
    getImagePath: function (word: string, basePath = 'assets/images/theni12'): string {
        const safeFilename = this.getSafeFilename(word);
        if (!safeFilename) return '';

        // Detect if we're in a subdirectory (like /html/) and adjust path accordingly
        const isHtmlSubdir = window.location.pathname.includes('/html/');
        const pathPrefix = isHtmlSubdir ? '../' : './';
        return `${pathPrefix}${basePath}/${safeFilename}.jpg`;
    },
};
