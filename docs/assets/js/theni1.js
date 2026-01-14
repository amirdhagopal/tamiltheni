// Theni 1 - JavaScript Module
// Refactored from inline script

(function () {
    'use strict';

    // State variables
    let currentSlide = 0;
    let audioEnabled = true;
    let audioTimeout = null;
    // synth removed - using TheniAudio


    // Filter and sequence state
    let currentFilter = 'all';
    let selectedCategories = [];
    let availableCategories = [];
    let allSlides = [];
    let filteredSlides = [];
    let originalOrder = [];
    let isShuffled = false;

    // Timer state deferred to shared timer.js


    // Speech Recognition setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    let isRecording = false;

    // Audio unlock handled by timer.js


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
            window.TheniUtils.shuffleArray(filteredSlides);
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
    // speakWord removed - using TheniAudio.speak


    function toggleAudio() {
        const audioCheckbox = document.getElementById('audioToggle');
        audioEnabled = audioCheckbox.checked;

        if (audioEnabled) {
            const currentElement = filteredSlides[currentSlide];
            if (currentElement) {
                const wordEn = currentElement.querySelector('.word-en');
                if (wordEn) window.TheniAudio.speak(wordEn.textContent, 'en-US');
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
                            if (audioEnabled) window.TheniAudio.speak(wordEn.textContent, 'en-US');
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

        window.TheniUtils.updateProgress(currentSlide, filteredSlides.length, 'progressBar', 'counter');

        updateProgress();

        if (filteredSlides[currentSlide]) {
            const slideId = filteredSlides[currentSlide].id.replace('slide-', '');
            const hash = `#${parseInt(slideId) + 1}`;
            if (window.location.hash !== hash) {
                window.history.replaceState(null, null, hash);
            }
        }

        if (document.getElementById('showTimer').checked) {
            if (window.TheniTimer) window.TheniTimer.restart();
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

    // Timer Functions delegated to timer.js


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
    window.toggleTimer = () => window.TheniTimer && window.TheniTimer.toggle();
    window.toggleTimerVisibility = () => window.TheniTimer && window.TheniTimer.toggleVisibility();
    window.resetTimer = () => window.TheniTimer && window.TheniTimer.reset();
    window.goToFirst = goToFirst;
    window.goToLast = goToLast;
    window.changeSlide = changeSlide;
    window.handleNextAction = handleNextAction;

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        if (window.TheniLayout) {
            window.TheniLayout.init({
                title: "பியோரியா தமிழ்ப் பள்ளி - தமிழ்த் தேனி 2026 - Theni 1",
                contentHTML: `
                    <div class="control-row">
                        <span class="control-label">Categories:</span>
                        <div class="category-dropdown">
                            <button class="dropdown-button" onclick="toggleDropdown(event)">
                                <span id="selectedCatText">All Categories</span>
                                <span>▼</span>
                            </button>
                            <div class="dropdown-menu" id="categoryMenu">
                                <div class="dropdown-item header" onclick="toggleAllCategories(event)">
                                    <input type="checkbox" id="selectAllCats" checked>
                                    <span>Select All / None</span>
                                </div>
                                <div id="categoryList"></div>
                            </div>
                        </div>
                    </div>
                    <div class="control-row">
                        <span class="control-label">Difficulty:</span>
                        <div class="pill-group">
                            <button class="pill-button active" onclick="filterDifficulty('all')" id="filterAll">All</button>
                            <button class="pill-button" onclick="filterDifficulty('D1')" id="filterD1">D1 Only</button>
                            <button class="pill-button" onclick="filterDifficulty('D2')" id="filterD2">D2 Only</button>
                        </div>
                    </div>
                    <div class="control-row">
                        <span class="control-label">Sequence:</span>
                        <div class="pill-group">
                            <button class="action-button" onclick="shuffleSlides()"><span>🔀</span> Shuffle</button>
                            <button class="action-button" onclick="resetSequence()"><span>↩️</span> Reset</button>
                        </div>
                        <div style="margin-left: auto; display: flex; gap: 15px;">
                            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.85em;">
                                <input type="checkbox" id="showTimer" onchange="window.toggleTimerVisibility()" checked> ⏱️ Timer (8s)
                            </label>
                            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.85em;">
                                <input type="checkbox" id="audioToggle" onchange="window.toggleAudio()" checked> 🔊 Audio
                            </label>
                        </div>
                    </div>
                    <div class="control-row">
                        <span class="control-label">Progress:</span>
                        <span class="progress-info" id="progressInfo">Loading...</span>
                    </div>
                `,
                timerDisplay: "00:08",
                injectNavigation: true
            });
        }

            generateSlides();
            populateCategories();
            updateProgress();
            updateProgress();
            if (window.TheniTimer) {
                window.TheniTimer.init(window.TheniConfig.timerDurations.theni1);
            }

            if (window.location.hash) {
                handleHashChange();
            } else {
                updateUI();
            }
        });
})();
