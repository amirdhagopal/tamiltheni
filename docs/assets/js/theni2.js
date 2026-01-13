
(function () {
    console.log("Theni2 script loaded - Instance check");
    let currentSlide = 0;
    const totalSlides = 800;

    // Audio state
    let audioEnabled = false; // Default to off - user must enable with click (required for strict browsers)
    let audioTimeout = null;
    const synth = window.speechSynthesis;

    // Filter and sequence state
    let currentFilter = 'all'; // Difficulty
    let selectedCategories = []; // List of selected Category strings "En - Ta"
    let availableCategories = []; // All unique categories found in slides
    let allSlides = [];
    let filteredSlides = [];
    let originalOrder = [];
    let isShuffled = false;
    let viewedPartners = {}; // Stores index -> partnerIndex mapping for persistence
    let sentenceCache = {}; // Stores "word1|word2" -> {tamil, english}

    // Timer state handled by shared timer.js



    // Initialize
    document.addEventListener('DOMContentLoaded', initApp);

    // Audio unlock handled by timer.js


    async function initApp() {
        // Load Data
        await loadSlidesData();

        // Initialize slide arrays
        allSlides = Array.from(document.querySelectorAll('.slide'));
        filteredSlides = [...allSlides];
        originalOrder = [...allSlides];

        // Populate categories from the slides
        populateCategories();

        // Update progress on load
        updateProgress();

        // Initialize timer
        if (window.TheniTimer) {
            window.TheniTimer.init(20);
        }

        if (window.location.hash) {
            handleHashChange();
        } else {
            updateUI();
        }

        // Global Event Listeners (replacing inline if possible, but for now maintaining compat)
    }


    async function loadSlidesData() {
        try {
            // Check if data is loaded
            if (!window.theniWords) {
                console.error("Data not found (window.theniWords is undefined)");
                // Fallback attempt with fetch if running on server (optional, but keeping it simple)
                try {
                    const response = await fetch('assets/data/theni_words.json');
                    if (response.ok) {
                        window.theniWords = await response.json();
                    } else {
                        throw new Error("Local data fetch failed");
                    }
                } catch (e) {
                    alert("Data loading failed. Please ensure assets/data/theni_words.js is loaded.");
                    return;
                }
            }

            const data = window.theniWords;

            const wrapper = document.getElementById('slides-wrapper');
            if (!wrapper) return;

            data.forEach((item, index) => {
                const el = document.createElement('div');
                el.className = index === 0 ? 'slide active' : 'slide';
                el.id = `slide-${index}`;

                const safeImage = getSafeFilename(item.image_word || item.word_en);

                // Note: We use the same HTML structure as original
                el.innerHTML = `
                    <div class="category-badge">${item.category}</div>
                    <div class="category-badge-ta">${item.category_ta}</div>
                    <div class="sno-badge">${index + 1}</div>
                    <div class="difficulty-badge">${item.difficulty}</div>
                    <div class="word-en">${item.word_en}</div>
                    <div class="image-container">
                        <img src="assets/images/theni12/${safeImage}.jpg" 
                             data-word="${item.image_word || item.word_en}" 
                             alt="${item.word_en}" 
                             class="slide-image"
                             onerror="this.src='https://placehold.co/400x300?text=${encodeURIComponent(item.word_en)}'">
                    </div>
                    <div class="word-ta">${item.word_ta}</div>
                 `;
                wrapper.appendChild(el);
            });

        } catch (e) {
            console.error("Error loading slides:", e);
        }
    }

    function getSafeFilename(word) {
        if (!word) return '';
        return word.replace(/[^a-zA-Z0-9 \-_]/g, '').trim().replace(/\s+/g, '_').toLowerCase();
    }

    // Cache for images to avoid re-fetching
    const imageCache = {};

    // --- Exposed Functions ---
    window.toggleControlPanel = toggleControlPanel;
    window.toggleDropdown = toggleDropdown;
    window.toggleCategory = toggleCategory;
    window.toggleAllCategories = toggleAllCategories;
    window.filterDifficulty = filterDifficulty;
    window.shuffleSlides = shuffleSlides;
    window.resetSequence = resetSequence;
    window.generateSentence = generateSentence;
    window.toggleTimer = () => window.TheniTimer && window.TheniTimer.toggle();
    window.saveApiKey = saveApiKey;
    window.toggleAudio = toggleAudio;
    window.toggleTimerVisibility = () => window.TheniTimer && window.TheniTimer.toggleVisibility();

    // Navigation
    window.handleNextAction = handleNextAction;
    window.goToFirst = goToFirst;
    window.goToLast = goToLast;
    window.changeSlide = changeSlide;

    function toggleControlPanel() {
        const panel = document.getElementById('controlPanel');
        panel.classList.toggle('collapsed');
        // Hide dropdown menu if panel is collapsed
        document.getElementById('categoryMenu').classList.remove('show');
    }

    function toggleDropdown(event) {
        event.stopPropagation();
        document.getElementById('categoryMenu').classList.toggle('show');
    }

    // Close dropdown and control panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.category-dropdown')) {
            const menu = document.getElementById('categoryMenu');
            if (menu) menu.classList.remove('show');
        }

        // Collapse control panel if clicking outside of it
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
        selectedCategories = [...availableCategories]; // Select all by default

        const list = document.getElementById('categoryList');
        if (list) {
            list.innerHTML = '';
            availableCategories.forEach(cat => {
                const item = document.createElement('div');
                item.className = 'dropdown-item';
                item.onclick = (e) => toggleCategory(cat, e);
                item.innerHTML = `
                <input type="checkbox" checked id="cat-${cat}" onclick="event.stopPropagation(); toggleCategory('${cat}', event)">
                <span>${cat}</span>
            `;
                list.appendChild(item);
            });
        }
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

        // Update UI
        const checkbox = document.getElementById(`cat-${category}`);
        if (checkbox) checkbox.checked = selectedCategories.includes(category);

        updateCategoryText();
        applyFilters();
    }

    function toggleAllCategories(event) {
        const checkbox = document.getElementById('selectAllCats');

        // If the div was clicked (not the checkbox itself), toggle the checkbox manually
        if (event.target !== checkbox) {
            checkbox.checked = !checkbox.checked;
        }

        const targetState = checkbox.checked;

        if (targetState) {
            selectedCategories = [...availableCategories];
        } else {
            selectedCategories = [];
        }

        // Update UI for all individual category checkboxes
        document.querySelectorAll('#categoryList input').forEach(cb => {
            cb.checked = targetState;
        });

        updateCategoryText();
        applyFilters();
    }

    function updateCategoryText() {
        const text = document.getElementById('selectedCatText');
        const checkbox = document.getElementById('selectAllCats');
        if (!text || !checkbox) return;

        if (selectedCategories.length === availableCategories.length) {
            text.textContent = 'All Categories';
            checkbox.checked = true;
        } else if (selectedCategories.length === 0) {
            text.textContent = 'None selected';
            checkbox.checked = false;
        } else {
            text.textContent = `${selectedCategories.length} selected`;
            checkbox.checked = false;
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
            // Fisher-Yates shuffle
            for (let i = filteredSlides.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [filteredSlides[i], filteredSlides[j]] = [filteredSlides[j], filteredSlides[i]];
            }
        }

        // Reset partner history when filters change
        viewedPartners = {};

        if (resetToStart) currentSlide = 0;
        updateProgress();
        updateUI();
    }

    function filterDifficulty(difficulty) {
        currentFilter = difficulty;

        // Update button states
        document.querySelectorAll('.pill-button').forEach(btn => btn.classList.remove('active'));
        const btn = document.getElementById(`filter${difficulty === 'all' ? 'All' : difficulty}`);
        if (btn) btn.classList.add('active');

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
        const totalD1 = allSlides.filter(s => s.querySelector('.difficulty-badge').textContent === 'D1').length;
        const totalD2 = allSlides.filter(s => s.querySelector('.difficulty-badge').textContent === 'D2').length;

        const currentFilteredD1 = filteredSlides.filter(s => s.querySelector('.difficulty-badge').textContent === 'D1').length;
        const currentFilteredD2 = filteredSlides.filter(s => s.querySelector('.difficulty-badge').textContent === 'D2').length;

        let filterText = currentFilter === 'all' ? 'All Difficulty' : currentFilter;
        let shuffleText = isShuffled ? ' (Shuffled)' : '';

        const progressInfo = document.getElementById('progressInfo');
        if (progressInfo) {
            progressInfo.textContent =
                `${filteredSlides.length === 0 ? 0 : currentSlide + 1}/${filteredSlides.length} slides - Filter: ${filterText}${shuffleText} (Matches: D1=${currentFilteredD1}, D2=${currentFilteredD2})`;
        }
    }

    // fetchImage removed as needed, logic integrated into template or updateCard

    // Timer functions delegated to timer.js



    function speakWord(word, lang = null, cancelPrevious = true) {
        if (!audioEnabled || !word || !synth) return;

        // Only cancel if explicitly requested (for new slide navigation)
        if (cancelPrevious) {
            synth.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(word);

        // Auto-detect language if not specified
        // Tamil Unicode range: \u0B80-\u0BFF
        if (lang) {
            utterance.lang = lang;
        } else if (/[\u0B80-\u0BFF]/.test(word)) {
            utterance.lang = 'ta-IN';
        } else {
            utterance.lang = 'en-US';
        }

        utterance.rate = 0.9;
        utterance.pitch = 1;

        // Try to find a matching voice
        const voices = synth.getVoices();
        if (voices.length > 0) {
            const matchingVoice = voices.find(v => v.lang.startsWith(utterance.lang.split('-')[0]));
            if (matchingVoice) {
                utterance.voice = matchingVoice;
            }
        }

        // Resume if paused
        if (synth.paused) {
            synth.resume();
        }

        synth.speak(utterance);

        // Chrome bug workaround: force resume in case it stops
        const resumeInterval = setInterval(() => {
            if (!synth.speaking) {
                clearInterval(resumeInterval);
            } else if (synth.paused) {
                synth.resume();
            }
        }, 100);

        utterance.onend = () => clearInterval(resumeInterval);
        utterance.onerror = () => clearInterval(resumeInterval);
    }

    function toggleAudio() {
        const audioCheckbox = document.getElementById('audioToggle');
        audioEnabled = audioCheckbox.checked;

        if (audioEnabled) {
            // Speak both words in dual-card mode
            const slide1 = filteredSlides[currentSlide];
            const partnerIdx = viewedPartners[currentSlide];
            const slide2 = partnerIdx !== undefined ? filteredSlides[partnerIdx] : null;

            if (slide1) {
                const word1 = slide1.querySelector('.word-en')?.textContent;
                const word2 = slide2?.querySelector('.word-en')?.textContent;

                if (word1) {
                    speakWord(word1, null, true);
                    if (word2) {
                        setTimeout(() => {
                            if (audioEnabled) speakWord(word2, null, false);
                        }, 1500);
                    }
                }
            }
        } else {
            if (audioTimeout) clearTimeout(audioTimeout);
            if (synth) synth.cancel();
        }
    }

    function updateUI() {
        // Reset AI Sentence Result
        document.getElementById('aiResult').style.display = 'none';
        document.getElementById('aiText').textContent = '';
        document.getElementById('aiTextEn').textContent = '';
        document.getElementById('aiBtn').disabled = false;
        document.getElementById('aiBtn').innerHTML = '<span>✨</span> Generate Sentence with AI';

        // Dual view mode - show two cards
        // Reset revealed state for both cards
        document.getElementById('card1').classList.remove('revealed');
        document.getElementById('card2').classList.remove('revealed');

        if (filteredSlides.length < 2) {
            // Not enough slides for dual view
            document.getElementById('card1En').textContent = 'Not enough words';
            document.getElementById('card1Ta').textContent = '';
            document.getElementById('card2En').textContent = 'Apply different filters';
            document.getElementById('card2Ta').textContent = '';
            return;
        }

        // Get first slide (current position)
        const slide1 = filteredSlides[currentSlide];

        // Get second slide (persistent random)
        let randomIdx;

        if (viewedPartners[currentSlide] !== undefined) {
            // Use stored partner if we visited this slide before in this session
            randomIdx = viewedPartners[currentSlide];
        } else {
            // Generate new partner
            do {
                randomIdx = Math.floor(Math.random() * filteredSlides.length);
            } while (randomIdx === currentSlide);
            // Store it
            viewedPartners[currentSlide] = randomIdx;
        }

        const slide2 = filteredSlides[randomIdx];

        // Update Card 1
        updateCard(1, slide1);

        // Update Card 2
        updateCard(2, slide2);

        // Pronounce both words if audio is enabled
        // Call speech directly (no setTimeout) to maintain user gesture chain for strict browsers
        if (audioEnabled) {
            const word1 = slide1.querySelector('.word-en')?.textContent;
            const word2 = slide2.querySelector('.word-en')?.textContent;
            if (word1) {
                speakWord(word1, null, true);
                // Queue second word - SpeechSynthesis handles queuing natively
                if (word2) {
                    speakWord(word2, null, false);
                }
            }
        }

        // Update buttons
        document.getElementById('firstBtn').disabled = currentSlide === 0;
        document.getElementById('prevBtn').disabled = currentSlide === 0;
        document.getElementById('nextBtn').disabled = currentSlide === filteredSlides.length - 1;
        document.getElementById('lastBtn').disabled = currentSlide === filteredSlides.length - 1;

        // Update counter
        document.getElementById('counter').innerText = `${currentSlide + 1} / ${filteredSlides.length}`;

        // Update progress bar
        const progress = ((currentSlide + 1) / filteredSlides.length) * 100;
        document.getElementById('progressBar').style.width = `${progress}%`;

        // Update progress info
        updateProgress();

        // Restart timer on new slide if enabled
        const timerCheck = document.getElementById('showTimer');
        if (timerCheck && timerCheck.checked) {
            if (window.TheniTimer) window.TheniTimer.restart();
        }
    }

    function updateCard(cardNum, slide) {
        const prefix = 'card' + cardNum;

        // Get data from slide
        const wordEn = slide.querySelector('.word-en')?.textContent || '';
        const wordTa = slide.querySelector('.word-ta')?.textContent || '';
        const category = slide.querySelector('.category-badge')?.textContent || '';
        const categoryTa = slide.querySelector('.category-badge-ta')?.textContent || '';
        const difficulty = slide.querySelector('.difficulty-badge')?.textContent || '';
        const img = slide.querySelector('.slide-image');
        const word = img?.dataset.word || wordEn.toLowerCase();

        // Update card elements
        document.getElementById(prefix + 'En').textContent = wordEn;
        document.getElementById(prefix + 'Ta').textContent = wordTa;
        document.getElementById(prefix + 'Cat').textContent = category;
        document.getElementById(prefix + 'CatTa').textContent = categoryTa;
        document.getElementById(prefix + 'Diff').textContent = difficulty;

        // Load image
        const cardImg = document.getElementById(prefix + 'Img');
        if (cardImg) {
            // Same logic as fetchImage in theni1 - remove special chars, replace spaces with underscores
            const safeFilename = getSafeFilename(word);
            // Check cache first
            if (imageCache[word]) {
                cardImg.src = imageCache[word];
            } else {
                cardImg.src = `assets/images/theni12/${safeFilename}.jpg`;
                cardImg.onerror = function () {
                    this.src = `https://placehold.co/300x180?text=${encodeURIComponent(wordEn)}`;
                };
            }
            cardImg.alt = wordEn;
        }
    }

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

        // Check if both cards are revealed
        const card1 = document.getElementById('card1');
        const card2 = document.getElementById('card2');
        const bothRevealed = card1.classList.contains('revealed') && card2.classList.contains('revealed');

        if (bothRevealed) {
            // Already revealed, move to next slide
            changeSlide(1);
        } else {
            // Not revealed yet, reveal both cards
            card1.classList.add('revealed');
            card2.classList.add('revealed');
        }
    }

    function handleHashChange() {
        const hash = window.location.hash.substring(1);
        const targetSlideId = `slide-${parseInt(hash) - 1}`;
        // Note: slide IDs are parsed 0-based from logic above, hash usually is 1-based index?
        // Logic: parseInt(hash) - 1

        const index = filteredSlides.findIndex(s => s.id === targetSlideId);
        if (index !== -1) {
            currentSlide = index;
            updateUI();
        } else if (filteredSlides.length > 0) {
            // If current hash slide isn't in filtered view, ensure we are at a valid index
            if (currentSlide >= filteredSlides.length) currentSlide = 0;
            updateUI();
        }
    }

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
        // Filter shortcuts
        if (e.key === '1') filterDifficulty('D1');
        if (e.key === '2') filterDifficulty('D2');
        if (e.key === 'a' || e.key === 'A') filterDifficulty('all');
        // Shuffle/Reset shortcuts
        if (e.key === 's' || e.key === 'S') shuffleSlides();
        if (e.key === 'r' || e.key === 'R') resetSequence();
    });

    window.addEventListener('hashchange', handleHashChange);
})();
