// Theni 1 - JavaScript Module
// Refactored from inline script

(function () {
    'use strict';

    // State variables
    let currentSlide = 0;
    let audioEnabled = true;
    let audioTimeout = null;
    const synth = window.speechSynthesis;

    // Filter and sequence state
    let currentFilter = 'all';
    let selectedCategories = [];
    let availableCategories = [];
    let allSlides = [];
    let filteredSlides = [];
    let originalOrder = [];
    let isShuffled = false;

    // Timer Variables (8 seconds)
    const TIMER_DURATION = 8;
    let timeLeft = TIMER_DURATION;
    let timerId = null;
    let audioCtx = null;
    let timerJustRestarted = false;
    let restartTimeoutId = null;

    // Speech Recognition setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    let isRecording = false;

    // Audio unlock for strict browsers (Comet/WebKit)
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
                console.log('AudioContext unlocked successfully');
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

    // Initialize speech recognition
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'ta-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            const speechResult = event.results[0][0].transcript.trim();
            validateVoiceResult(speechResult);
        };

        recognition.onerror = (event) => {
            if (event.error !== 'no-speech') {
                console.error('Speech recognition error:', event.error);
                showFeedback("Error: " + event.error, "error");
            }
            stopRecording();
        };

        recognition.onend = () => {
            if (isRecording) stopRecording();
        };
    } else {
        console.warn('Speech recognition not supported.');
        const micBtn = document.getElementById('micBtn');
        if (micBtn) micBtn.style.display = 'none';
    }

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
                <div class="word-en">${item.word_en}</div>
                <div class="image-container">
                    <img src="https://placehold.co/400x300?text=Loading..." 
                         data-word="${item.image_word}" 
                         alt="${item.word_en}" 
                         class="slide-image">
                </div>
                <div class="word-ta">${item.word_ta}</div>
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

    function fetchImage(word, imgElement) {
        if (!word) return;

        let safeFilename = word.replace(/[^a-zA-Z0-9 \-_]/g, '').trim().replace(/\s+/g, '_');
        const localPath = `assets/images/theni12/${safeFilename}.jpg`;

        imgElement.onerror = function () {
            this.onerror = null;
            console.warn(`Missing local image for: ${word} (${localPath})`);
            this.src = `https://placehold.co/400x300?text=${encodeURIComponent(word)}`;
        };

        imgElement.src = localPath;
    }

    // Voice Recognition
    function toggleVoiceRecognition() {
        if (!recognition) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }

    function startRecording() {
        try {
            recognition.start();
            isRecording = true;
            const micBtn = document.getElementById('micBtn');
            micBtn.classList.add('recording');
            micBtn.title = "Voice Validation is ACTIVE - Click to Stop Listening";
            showFeedback("Listening for Tamil...", "success");
        } catch (e) {
            console.error('Recognition start error:', e);
        }
    }

    function stopRecording() {
        if (recognition && isRecording) {
            recognition.stop();
        }
        isRecording = false;
        const micBtn = document.getElementById('micBtn');
        if (micBtn) {
            micBtn.classList.remove('recording');
            micBtn.title = "Voice Validation is IDLE - Click to Start Listening";
        }
    }

    function validateVoiceResult(spokenText) {
        const currentElement = filteredSlides[currentSlide];
        if (!currentElement) return;

        const targetText = currentElement.querySelector('.word-ta').textContent.trim();
        const normalize = (text) => text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s+/g, "");

        const normalizedSpoken = normalize(spokenText);
        const normalizedTarget = normalize(targetText);

        if (normalizedSpoken === normalizedTarget || normalizedTarget.includes(normalizedSpoken) || normalizedSpoken.includes(normalizedTarget)) {
            showFeedback(`Correct! ✅ (${spokenText})`, "success");
            currentElement.classList.add('revealed');
        } else {
            showFeedback(`Heard "${spokenText}" ❌`, "error");
        }

        stopRecording();
    }

    function showFeedback(text, type) {
        const feedback = document.getElementById('voiceFeedback');
        feedback.textContent = text;
        feedback.className = `voice-feedback ${type}`;

        if (type !== 'recording' && !text.includes("Listening")) {
            setTimeout(() => {
                if (feedback.textContent === text) {
                    feedback.className = 'voice-feedback';
                }
            }, 4000);
        }
    }

    // Audio
    function speakWord(word) {
        if (!audioEnabled || !word || !synth) return;
        synth.cancel();

        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        synth.speak(utterance);
    }

    function toggleAudio() {
        const audioCheckbox = document.getElementById('audioToggle');
        audioEnabled = audioCheckbox.checked;

        if (audioEnabled) {
            const currentElement = filteredSlides[currentSlide];
            if (currentElement) {
                const wordEn = currentElement.querySelector('.word-en');
                if (wordEn) speakWord(wordEn.textContent);
            }
        } else {
            if (audioTimeout) clearTimeout(audioTimeout);
            if (synth) synth.cancel();
        }
    }

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

                const img = s.querySelector('.slide-image');
                if (img && img.dataset.word && !img.dataset.loaded) {
                    fetchImage(img.dataset.word, img);
                    img.dataset.loaded = "true";
                }

                const wordEn = s.querySelector('.word-en');
                if (wordEn) {
                    if (audioTimeout) clearTimeout(audioTimeout);
                    if (audioEnabled) {
                        audioTimeout = setTimeout(() => {
                            if (audioEnabled) speakWord(wordEn.textContent);
                        }, 300);
                    }
                }

                stopRecording();
                const feedback = document.getElementById('voiceFeedback');
                if (feedback) feedback.className = 'voice-feedback';
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
        timeLeft = TIMER_DURATION;
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

            if (timeLeft > 0 && timeLeft <= 3 && !timerJustRestarted) {
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

        const angle = (timeLeft / TIMER_DURATION) * 360;
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
    window.toggleVoiceRecognition = toggleVoiceRecognition;
    window.toggleAudio = toggleAudio;
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
        toggleTimerVisibility();

        if (window.location.hash) {
            handleHashChange();
        } else {
            updateUI();
        }
    });
})();
