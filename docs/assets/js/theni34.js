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

    // Timer state deferred to shared timer.js




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

        // Update Timer handled by shared module
        if (window.TheniTimer) {
            window.TheniTimer.setDuration(timerDuration);

            if (document.getElementById('showTimer').checked) {
                window.TheniTimer.restart();
            }
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

    window.setTheniLevel = setTheniLevel;
    window.toggleTimer = () => window.TheniTimer && window.TheniTimer.toggle();
    window.toggleTimerVisibility = () => window.TheniTimer && window.TheniTimer.toggleVisibility();
    window.resetTimer = () => window.TheniTimer && window.TheniTimer.reset();
    window.goToFirst = goToFirst;
    window.goToLast = goToLast;
    window.changeSlide = changeSlide;
    window.handleNextAction = handleNextAction;

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        generateSlides();
        populateCategories();
        updateProgress();
        updateProgress();
        // Default to Level 3 (Timer handled inside setTheniLevel -> global timer)
        setTheniLevel(3);

        // Ensure timer is init if setTheniLevel didn't fully (redundant but safe)
        if (window.TheniTimer && window.TheniTimer.duration === 15) {
            // Already set by setTheniLevel(3)
        } else if (window.TheniTimer) {
            window.TheniTimer.init(15);
        }

        if (window.location.hash) {
            handleHashChange();
        } else {
            updateUI();
        }
    });
})();
