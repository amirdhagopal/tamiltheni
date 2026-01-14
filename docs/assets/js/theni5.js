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
        if (window.TheniTimer) window.TheniTimer.init(window.TheniConfig.timerDurations.theni5);
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
                document.body.classList.remove('panel-expanded');
            }

            // Interaction for slide advancement
            if (e.target.closest('#slide-surface')) {
                if (wasCollapsed) {
                    nextSlide();
                } else {
                    panel.classList.add('collapsed');
                    document.body.classList.remove('panel-expanded');
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
        window.TheniUtils.updateProgress(currentSlide, totalPages, 'progressBar', 'counter');

        document.getElementById('prevBtn').disabled = currentSlide === 0;
        document.getElementById('nextBtn').disabled = (currentSlide === totalPages - 1);
        document.getElementById('firstBtn').disabled = currentSlide === 0;
        document.getElementById('lastBtn').disabled = currentSlide === totalPages - 1;
    }

    function shuffleWords() {
        window.TheniUtils.shuffleArray(activeWords);
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

    // Timer duration setter
    window.setTimerDuration = function (seconds) {
        // Update pill button states
        document.querySelectorAll('#timer30, #timer60, #timer120').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`timer${seconds}`);
        if (activeBtn) activeBtn.classList.add('active');

        // Set timer duration
        if (window.TheniTimer) {
            window.TheniTimer.setDuration(seconds);
            if (document.getElementById('showTimer').checked) {
                window.TheniTimer.restart();
            }
        }
    };

    // Control panel toggle for layout.js onclick handler
    window.toggleControlPanel = function () {
        const panel = document.getElementById('controlPanel');
        if (panel) {
            panel.classList.toggle('collapsed');
            // Sync body class for layout adjustments
            if (panel.classList.contains('collapsed')) {
                document.body.classList.remove('panel-expanded');
            } else {
                document.body.classList.add('panel-expanded');
            }
        }
    };

    // Navigation functions for layout.js (maps to theni5's slide functions)
    window.goToFirst = () => goToSlide(0);
    window.goToLast = () => goToSlide(totalPages - 1);
    window.changeSlide = (dir) => { if (dir > 0) nextSlide(); else prevSlide(); };
    window.handleNextAction = nextSlide;

    // Make totalPages accessible dynamically
    Object.defineProperty(window, 'totalPages', {
        get: () => totalPages
    });

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        if (window.TheniLayout) {
            window.TheniLayout.init({
                title: "Theni 5 Mastery",
                contentHTML: `
                     <div class="control-row">
                        <span class="control-label">Range:</span>
                        <input type="number" id="startRange" value="1" min="1" max="250" style="width: 70px; padding: 5px; border-radius: 4px; border: 1px solid #ddd;">
                        <span style="margin: 0 10px;">to</span>
                        <input type="number" id="endRange" value="250" min="1" max="250" style="width: 70px; padding: 5px; border-radius: 4px; border: 1px solid #ddd;">
                        <button class="action-button" onclick="window.applyFilters()" style="margin-left: 10px;">Apply</button>
                    </div>
                    <div class="control-row">
                        <span class="control-label">Actions:</span>
                        <button class="action-button" onclick="window.shuffleWords()"><span>🔀</span> Shuffle</button>
                        <button class="action-button" onclick="window.resetWords()"><span>↩️</span> Reset</button>
                        <div style="margin-left: auto; display: flex; gap: 15px;">
                            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.85rem;">
                                <input type="checkbox" id="showTimer" onchange="window.toggleTimerVisibility()" checked> Timer (1m)
                            </label>
                        </div>
                    </div>
                `,
                timerDisplay: "01:00",
                injectNavigation: true
            });
        }
            init();
        });
})();
