// Theni 5 - JavaScript Module
// Refactored from inline script

(function () {
    'use strict';

    const rawWords = window.theni5Words || [];
    let activeWords = [...rawWords];
    let currentSlide = 0;
    let totalPages = 50;

    // Timer state deferred to shared timer.js


    // Audio unlock for strict browsers
    function unlockAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        const resumePromise = audioCtx.resume();
        if (resumePromise) {
            resumePromise.then(() => {
                const silentBuffer = audioCtx.createBuffer(1, 1, 22050);
                const source = audioCtx.createBufferSource();
                source.buffer = silentBuffer;
                source.connect(audioCtx.destination);
                source.start(0);
            }).catch(err => {
                console.warn('AudioContext resume failed:', err);
            });
        }

        document.removeEventListener('click', unlockAudioContext);
        document.removeEventListener('touchstart', unlockAudioContext);
        document.removeEventListener('keydown', unlockAudioContext);
    }

    document.addEventListener('click', unlockAudioContext);
    document.addEventListener('touchstart', unlockAudioContext);
    document.addEventListener('keydown', unlockAudioContext);

    function init() {
        updateSlideRange();
        if (window.TheniTimer) window.TheniTimer.init(60);
        renderSlide();

        // Event Listeners
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return;
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') nextSlide();
            if (e.key === 'Home') goToSlide(0);
            if (e.key === 'End') goToSlide(totalPages - 1);
        });

        document.addEventListener('click', (e) => {
            const panel = document.getElementById('controlPanel');
            const isClickInsidePanel = panel.contains(e.target);
            const isActionBtn = e.target.closest('button') || e.target.closest('input') || e.target.closest('a');

            if (isActionBtn) return;

            const wasCollapsed = panel.classList.contains('collapsed');

            if (!isClickInsidePanel) {
                panel.classList.add('collapsed');
            }

            // Interaction for slide advancement
            if (e.target.closest('#slide-surface')) {
                if (wasCollapsed) {
                    nextSlide();
                } else {
                    panel.classList.add('collapsed');
                }
            }
        });
    }

    function updateSlideRange() {
        const start = parseInt(document.getElementById('startRange').value) || 1;
        const end = parseInt(document.getElementById('endRange').value) || 250;

        activeWords = rawWords.filter(w => w.s >= start && w.s <= end);
        totalPages = Math.ceil(activeWords.length / 5);
        currentSlide = 0;
        renderSlide();
    }

    function renderSlide() {
        const grid = document.getElementById('wordsGrid');
        grid.innerHTML = '';

        const startIdx = currentSlide * 5;
        const slideWords = activeWords.slice(startIdx, startIdx + 5);

        if (slideWords.length === 0 && activeWords.length > 0) {
            currentSlide = 0;
            return renderSlide();
        }

        slideWords.forEach((item, i) => {
            const div = document.createElement('div');
            div.className = 'word-item';
            div.id = `word-${i}`;
            div.innerHTML = `<div class="tamil-word">${item.w}</div>`;
            grid.appendChild(div);
        });

        updateUI();

        // Restart timer on new slide if enabled
        // Restart timer on new slide if enabled
        if (document.getElementById('showTimer').checked) {
            if (window.TheniTimer) window.TheniTimer.restart();
        }
    }

    function nextSlide() {
        if (currentSlide < totalPages - 1) {
            currentSlide++;
            renderSlide();
        }
    }

    function prevSlide() {
        if (currentSlide > 0) {
            currentSlide--;
            renderSlide();
        }
    }

    function goToSlide(idx) {
        currentSlide = Math.max(0, Math.min(idx, totalPages - 1));
        renderSlide();
    }

    function updateUI() {
        document.getElementById('slideIndicator').innerText = `${currentSlide + 1} / ${totalPages || 1}`;
        document.getElementById('progressBar').style.width = `${((currentSlide + 1) / totalPages) * 100}%`;

        document.getElementById('prevBtn').disabled = currentSlide === 0;
        document.getElementById('nextBtn').disabled = (currentSlide === totalPages - 1);
        document.getElementById('firstBtn').disabled = currentSlide === 0;
        document.getElementById('lastBtn').disabled = currentSlide === totalPages - 1;
    }

    function shuffleWords() {
        for (let i = activeWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [activeWords[i], activeWords[j]] = [activeWords[j], activeWords[i]];
        }
        currentSlide = 0;
        renderSlide();
    }

    function resetWords() {
        const start = parseInt(document.getElementById('startRange').value) || 1;
        const end = parseInt(document.getElementById('endRange').value) || 250;
        activeWords = rawWords.filter(w => w.s >= start && w.s <= end);
        currentSlide = 0;
        renderSlide();
    }

    // Timer Logic deferred to timer.js


    function applyFilters() {
        updateSlideRange();
    }

    // Expose functions to window
    window.applyFilters = applyFilters;
    window.shuffleWords = shuffleWords;
    window.resetWords = resetWords;
    window.toggleTimerVisibility = () => window.TheniTimer && window.TheniTimer.toggleVisibility();
    window.toggleTimer = () => window.TheniTimer && window.TheniTimer.toggle();
    window.goToSlide = goToSlide;
    window.nextSlide = nextSlide;
    window.prevSlide = prevSlide;
    window.totalPages = totalPages;

    // Make totalPages accessible dynamically
    Object.defineProperty(window, 'totalPages', {
        get: () => totalPages
    });

    // Initialize
    document.addEventListener('DOMContentLoaded', init);
})();
