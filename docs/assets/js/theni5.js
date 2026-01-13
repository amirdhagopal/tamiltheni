// Theni 5 - JavaScript Module
// Refactored from inline script

(function () {
    'use strict';

    const rawWords = window.theni5Words || [];
    let activeWords = [...rawWords];
    let currentSlide = 0;
    let totalPages = 50;

    // Timer Variables (60 seconds)
    const TIMER_DURATION = 60;
    let timeLeft = TIMER_DURATION;
    let timerId = null;
    let audioCtx = null;
    let timerJustRestarted = false;
    let restartTimeoutId = null;

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
        if (document.getElementById('showTimer').checked) {
            restartTimer();
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

    // Timer Logic
    function toggleTimer() {
        const btn = document.getElementById('timerBtn');
        const pill = document.getElementById('timerPill');

        if (timerId) {
            clearInterval(timerId);
            timerId = null;
            btn.innerText = '▶';
            pill.classList.remove('alarm');
        } else {
            if (timeLeft <= 0) resetTimer();
            timerId = setInterval(tick, 1000);
            btn.innerText = '⏸';
        }
    }

    function resetTimer() {
        clearInterval(timerId);
        timerId = null;
        timeLeft = TIMER_DURATION;
        updateTimerDisplay();
        document.getElementById('timerBtn').innerText = '▶';
        document.getElementById('timerBtn').onclick = toggleTimer;
        document.getElementById('timerPill').classList.remove('alarm');
    }

    function restartTimer() {
        if (restartTimeoutId) {
            clearTimeout(restartTimeoutId);
        }
        timerJustRestarted = true;
        resetTimer();
        toggleTimer();
        restartTimeoutId = setTimeout(() => {
            timerJustRestarted = false;
            restartTimeoutId = null;
        }, 2000);
    }

    function tick() {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();

            if (timeLeft > 0 && timeLeft <= 5 && !timerJustRestarted) {
                playTickSound();
            }

            if (timeLeft === 0) {
                triggerAlarm();
            }
        }
    }

    function playTickSound() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const bufferSize = audioCtx.sampleRate * 0.03;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 3000;
        filter.Q.value = 2;

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        noise.start();
    }

    function updateTimerDisplay() {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        document.getElementById('timerDisplay').innerText =
            `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        const angle = (timeLeft / TIMER_DURATION) * 360;
        document.getElementById('timerPie').style.background =
            `conic-gradient(var(--primary) ${angle}deg, #f0f0f0 0)`;
    }

    function toggleTimerVisibility() {
        const isVisible = document.getElementById('showTimer').checked;
        const pill = document.getElementById('timerPill');
        pill.style.display = isVisible ? 'flex' : 'none';

        if (isVisible) {
            restartTimer();
        } else {
            resetTimer();
        }
    }

    function triggerAlarm() {
        clearInterval(timerId);
        timerId = null;
        document.getElementById('timerBtn').innerText = '↺';
        document.getElementById('timerBtn').onclick = resetTimer;
        document.getElementById('timerPill').classList.add('alarm');
        playAlarmSound();
    }

    function playAlarmSound() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const notes = [523.25, 659.25, 783.99];
        const noteDelay = 0.15;
        const noteDuration = 0.6;

        notes.forEach((freq, i) => {
            const startTime = audioCtx.currentTime + (i * noteDelay);

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(startTime);
            osc.stop(startTime + noteDuration);

            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();

            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(freq * 2, startTime);

            gain2.gain.setValueAtTime(0, startTime);
            gain2.gain.linearRampToValueAtTime(0.03, startTime + 0.05);
            gain2.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);

            osc2.start(startTime);
            osc2.stop(startTime + noteDuration);
        });
    }

    function applyFilters() {
        updateSlideRange();
    }

    // Expose functions to window
    window.applyFilters = applyFilters;
    window.shuffleWords = shuffleWords;
    window.resetWords = resetWords;
    window.toggleTimerVisibility = toggleTimerVisibility;
    window.toggleTimer = toggleTimer;
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
