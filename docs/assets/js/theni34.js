// Theni 1 - JavaScript Module
// Refactored from inline script

(function () {
    'use strict';

    // State variables
    let currentSlide = 0;
    let currentLevel = 3;

    // Filter and sequence state
    let currentFilter = 'all';
    let selectedCategories = [];
    let availableCategories = [];
    let allSlides = [];
    let filteredSlides = [];
    let originalOrder = [];
    let isShuffled = false;

    // Timer Variables
    let timerDuration = 15; // Default Theni 3
    let timeLeft = timerDuration;

    let timerId = null;
    let audioCtx = null;
    let timerJustRestarted = false;
    let restartTimeoutId = null;



    // Generate slides from data
    function generateSlides() {
        const wrapper = document.getElementById('slides-wrapper');
        if (!wrapper || !window.theniWords) {
            console.error('Missing slides-wrapper or theniWords');
            return;
        }

        wrapper.innerHTML = '';

        window.theniWords.forEach((item, index) => {
            const slide = document.createElement('div');
            slide.className = index === 0 ? 'slide active' : 'slide';
            slide.id = `slide-${index}`;

            slide.innerHTML = `
                <div class="category-badge">${item.category}</div>
                <div class="category-badge-ta">${item.category_ta}</div>
                <div class="sno-badge">${index + 1}</div>
                <div class="difficulty-badge">${item.difficulty}</div>
                <div class="word-en">${item.sentence_en || item.word_en}</div>
                <div class="word-ta">${item.sentence_ta || item.word_ta}</div>
            `;

            wrapper.appendChild(slide);
        });

        // Initialize arrays
        allSlides = Array.from(document.querySelectorAll('.slide'));
        filteredSlides = [...allSlides];
        originalOrder = [...allSlides];
    }

    // Control Panel
    function toggleControlPanel() {
        const panel = document.getElementById('controlPanel');
        panel.classList.toggle('collapsed');
        document.getElementById('categoryMenu').classList.remove('show');
    }

    function toggleDropdown(event) {
        event.stopPropagation();
        document.getElementById('categoryMenu').classList.toggle('show');
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.category-dropdown')) {
            document.getElementById('categoryMenu').classList.remove('show');
        }
        if (!e.target.closest('.control-panel')) {
            const panel = document.getElementById('controlPanel');
            if (panel && !panel.classList.contains('collapsed')) {
                panel.classList.add('collapsed');
            }
        }
    });

    function populateCategories() {
        const catMap = new Map();
        allSlides.forEach(slide => {
            const en = slide.querySelector('.category-badge').textContent;
            const ta = slide.querySelector('.category-badge-ta').textContent;
            const key = `${en} - ${ta}`;
            if (!catMap.has(key)) {
                catMap.set(key, true);
            }
        });

        availableCategories = Array.from(catMap.keys());
        selectedCategories = [...availableCategories];

        const list = document.getElementById('categoryList');
        list.innerHTML = '';

        availableCategories.forEach(cat => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.onclick = (e) => toggleCategory(cat, e);
            item.innerHTML = `
                <input type="checkbox" checked id="cat-${cat}" onclick="event.stopPropagation(); window.toggleCategory('${cat}', event)">
                <span>${cat}</span>
            `;
            list.appendChild(item);
        });

        updateCategoryText();
    }

    function toggleCategory(category, event) {
        if (event) event.stopPropagation();

        const index = selectedCategories.indexOf(category);
        if (index > -1) {
            selectedCategories.splice(index, 1);
        } else {
            selectedCategories.push(category);
        }

        const checkbox = document.getElementById(`cat-${category}`);
        if (checkbox) checkbox.checked = selectedCategories.includes(category);

        updateCategoryText();
        applyFilters();
    }

    function toggleAllCategories(event) {
        const checkbox = document.getElementById('selectAllCats');
        if (event.target !== checkbox) {
            checkbox.checked = !checkbox.checked;
        }

        const targetState = checkbox.checked;
        if (targetState) {
            selectedCategories = [...availableCategories];
        } else {
            selectedCategories = [];
        }

        document.querySelectorAll('#categoryList input').forEach(cb => {
            cb.checked = targetState;
        });

        updateCategoryText();
        applyFilters();
    }

    function updateCategoryText() {
        const text = document.getElementById('selectedCatText');
        if (selectedCategories.length === availableCategories.length) {
            text.textContent = 'All Categories';
            document.getElementById('selectAllCats').checked = true;
        } else if (selectedCategories.length === 0) {
            text.textContent = 'None selected';
            document.getElementById('selectAllCats').checked = false;
        } else {
            text.textContent = `${selectedCategories.length} selected`;
            document.getElementById('selectAllCats').checked = false;
        }
    }

    function applyFilters(resetToStart = true) {
        filteredSlides = allSlides.filter(slide => {
            const diffBadge = slide.querySelector('.difficulty-badge').textContent;
            const catBadge = slide.querySelector('.category-badge').textContent;
            const catBadgeTa = slide.querySelector('.category-badge-ta').textContent;
            const catKey = `${catBadge} - ${catBadgeTa}`;

            const difficultyMatch = (currentFilter === 'all' || diffBadge === currentFilter);
            const categoryMatch = selectedCategories.includes(catKey);

            return difficultyMatch && categoryMatch;
        });

        if (isShuffled) {
            for (let i = filteredSlides.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [filteredSlides[i], filteredSlides[j]] = [filteredSlides[j], filteredSlides[i]];
            }
        }

        if (resetToStart) currentSlide = 0;
        updateProgress();
        updateUI();
    }

    function filterDifficulty(difficulty) {
        currentFilter = difficulty;
        document.querySelectorAll('.pill-button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`filter${difficulty === 'all' ? 'All' : difficulty}`).classList.add('active');
        applyFilters();
    }

    function shuffleSlides() {
        isShuffled = true;
        applyFilters();
    }

    function resetSequence() {
        isShuffled = false;
        applyFilters();
    }

    function updateProgress() {
        const currentFilteredD1 = filteredSlides.filter(s => s.querySelector('.difficulty-badge').textContent === 'D1').length;
        const currentFilteredD2 = filteredSlides.filter(s => s.querySelector('.difficulty-badge').textContent === 'D2').length;

        let filterText = currentFilter === 'all' ? 'All Difficulty' : currentFilter;
        let shuffleText = isShuffled ? ' (Shuffled)' : '';

        document.getElementById('progressInfo').textContent =
            `${filteredSlides.length === 0 ? 0 : currentSlide + 1}/${filteredSlides.length} slides - Filter: ${filterText}${shuffleText} (Matches: D1=${currentFilteredD1}, D2=${currentFilteredD2})`;
    }

    // Audio removed

    // Level Control
    function setTheniLevel(level) {
        currentLevel = level;
        timerDuration = (level === 4) ? 40 : 15;

        // Update Buttons
        document.querySelectorAll('.pill-button').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`level${level}`);
        if (activeBtn) activeBtn.classList.add('active');

        // Restore difficulty filter button state
        document.getElementById(`filter${currentFilter === 'all' ? 'All' : currentFilter}`).classList.add('active');

        // Update Timer Label
        const timerLabel = document.getElementById('timerLabel');
        if (timerLabel) timerLabel.innerText = `Timer (${timerDuration}s)`;

        resetTimer();

        if (document.getElementById('showTimer').checked) {
            restartTimer();
        }
    }



    // Audio
    // Audio functions removed

    // UI Update
    function updateUI() {
        allSlides.forEach(s => {
            s.classList.remove('active');
            s.style.display = 'none';
        });

        filteredSlides.forEach((s, idx) => {
            s.style.display = idx === currentSlide ? 'flex' : 'none';
            if (idx === currentSlide) {
                s.classList.add('active');
            } else {
                s.classList.remove('revealed');
            }
        });

        document.getElementById('firstBtn').disabled = currentSlide === 0;
        document.getElementById('prevBtn').disabled = currentSlide === 0;
        document.getElementById('nextBtn').disabled = currentSlide === filteredSlides.length - 1;
        document.getElementById('lastBtn').disabled = currentSlide === filteredSlides.length - 1;

        document.getElementById('counter').innerText = `${currentSlide + 1} / ${filteredSlides.length}`;

        const progress = ((currentSlide + 1) / filteredSlides.length) * 100;
        document.getElementById('progressBar').style.width = `${progress}%`;

        updateProgress();

        if (filteredSlides[currentSlide]) {
            const slideId = filteredSlides[currentSlide].id.replace('slide-', '');
            const hash = `#${parseInt(slideId) + 1}`;
            if (window.location.hash !== hash) {
                window.history.replaceState(null, null, hash);
            }
        }

        if (document.getElementById('showTimer').checked) {
            restartTimer();
        }
    }

    // Navigation
    function goToFirst() {
        if (filteredSlides.length > 0) {
            currentSlide = 0;
            updateUI();
        }
    }

    function goToLast() {
        if (filteredSlides.length > 0) {
            currentSlide = filteredSlides.length - 1;
            updateUI();
        }
    }

    function changeSlide(direction) {
        const newIndex = currentSlide + direction;
        if (newIndex >= 0 && newIndex < filteredSlides.length) {
            currentSlide = newIndex;
            updateUI();
        }
    }

    function handleNextAction() {
        if (!filteredSlides[currentSlide]) return;

        if (filteredSlides[currentSlide].classList.contains('revealed')) {
            changeSlide(1);
        } else {
            filteredSlides[currentSlide].classList.add('revealed');
        }
    }

    function handleHashChange() {
        const hash = window.location.hash.substring(1);
        const targetSlideId = `slide-${parseInt(hash) - 1}`;

        const index = filteredSlides.findIndex(s => s.id === targetSlideId);
        if (index !== -1) {
            currentSlide = index;
            updateUI();
        } else if (filteredSlides.length > 0) {
            if (currentSlide >= filteredSlides.length) currentSlide = 0;
            updateUI();
        }
    }

    // Timer Functions
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
        timeLeft = timerDuration;
        updateTimerDisplay();
        document.getElementById('timerBtn').innerText = '▶';
        document.getElementById('timerBtn').onclick = function () { toggleTimer(); event.stopPropagation(); };
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

    function updateTimerDisplay() {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        document.getElementById('timerDisplay').innerText =
            `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        const angle = (timeLeft / timerDuration) * 360;
        document.getElementById('timerPie').style.background =
            `conic-gradient(#667eea ${angle}deg, #f0f0f0 0)`;
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
        document.getElementById('timerBtn').onclick = function () { resetTimer(); event.stopPropagation(); };
        document.getElementById('timerPill').classList.add('alarm');
        playAlarmSound();
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

    // Event Listeners
    document.getElementById('slides-wrapper').addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
            handleNextAction();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') changeSlide(-1);
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
            handleNextAction();
        }
        if (e.key === 'Home') goToFirst();
        if (e.key === 'End') goToLast();
        if (e.key === '1') filterDifficulty('D1');
        if (e.key === '2') filterDifficulty('D2');
        if (e.key === 'a' || e.key === 'A') filterDifficulty('all');
        if (e.key === 's' || e.key === 'S') shuffleSlides();
        if (e.key === 'r' || e.key === 'R') resetSequence();
    });

    window.addEventListener('hashchange', handleHashChange);

    // Expose functions to window for onclick handlers
    window.toggleControlPanel = toggleControlPanel;
    window.toggleDropdown = toggleDropdown;
    window.toggleCategory = toggleCategory;
    window.toggleAllCategories = toggleAllCategories;
    window.filterDifficulty = filterDifficulty;
    window.shuffleSlides = shuffleSlides;
    window.resetSequence = resetSequence;

    window.setTheniLevel = setTheniLevel;
    window.toggleTimer = toggleTimer;
    window.toggleTimerVisibility = toggleTimerVisibility;
    window.resetTimer = resetTimer;
    window.goToFirst = goToFirst;
    window.goToLast = goToLast;
    window.changeSlide = changeSlide;
    window.handleNextAction = handleNextAction;

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        generateSlides();
        populateCategories();
        updateProgress();
        setTheniLevel(3); // Default to Level 3

        if (window.location.hash) {
            handleHashChange();
        } else {
            updateUI();
        }
    });
})();
