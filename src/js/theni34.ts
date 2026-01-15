import { Utils } from './utils';
import { Timer } from './timer';
import { Layout } from './layout';
import { config } from './config';
import theniWords from '../data/theni_words.json';
import { Word } from '../types';

// State variables
let currentSlide = 0;
let currentLevel = 3;

// Filter and sequence state
let currentFilter = 'all';
let selectedCategories: string[] = [];
let availableCategories: string[] = [];
let allSlides: HTMLDivElement[] = [];
let filteredSlides: HTMLDivElement[] = [];
// let originalOrder = []; // Not used
let isShuffled = false;

// Generate slides from data
function generateSlides() {
    const wrapper = document.getElementById('slides-wrapper');
    if (!wrapper) return;

    wrapper.innerHTML = '';

    (theniWords as Word[]).forEach((item: Word, index: number) => {
        const slide = document.createElement('div');
        slide.className = index === 0 ? 'slide active' : 'slide';
        slide.id = `slide-${index}`;

        // Content logic: Both Theni 3 & 4 show Sentences (fallback to words)
        // Only Timer duration differs (handled in setTheniLevel)
        const enText = item.sentence_en || item.word_en;
        const taText = item.sentence_ta || item.word_ta;

        slide.innerHTML = `
            <div class="slide-content">
                <div class="slide-header">
                    <span class="category-badge">${item.category}</span>
                    <span class="category-badge-ta">${item.category_ta}</span>
                    <span class="difficulty-badge">${item.difficulty}</span>
                </div>
                <div class="slide-body">
                    <div class="word-en">${enText}</div>
                    <div class="word-ta">${taText}</div>
                </div>
            </div>
        `;

        wrapper.appendChild(slide);
    });

    // Initialize arrays
    allSlides = Array.from(document.querySelectorAll('.slide')) as HTMLDivElement[];
    // Restore shuffling if active?
    // Usually level switch should reset sequence, so we can ignore shuffle preservation here
    // unless strictly needed. But applyFilters usually handles filteredSlides.

    // We just refreshed DOM, so allSlides is fresh.
    // filteredSlides will be updated by applyFilters later.
}

// Control Panel
export function toggleControlPanel() {
    const panel = document.getElementById('controlPanel');
    if (panel) {
        panel.classList.toggle('collapsed');
        document.getElementById('categoryMenu')?.classList.remove('show');
    }
}

function toggleDropdown(event: Event) {
    event.stopPropagation();
    document.getElementById('categoryMenu')?.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!(e.target as Element).closest('.category-dropdown')) {
        document.getElementById('categoryMenu')?.classList.remove('show');
    }
    if (!(e.target as Element).closest('.control-panel')) {
        const panel = document.getElementById('controlPanel');
        if (panel && !panel.classList.contains('collapsed')) {
            panel.classList.add('collapsed');
        }
    }
});

function populateCategories() {
    const catMap = new Map();
    // Use theniWords directly since slides might change
    theniWords.forEach((item) => {
        const key = `${item.category} - ${item.category_ta}`;
        if (!catMap.has(key)) {
            catMap.set(key, true);
        }
    });

    availableCategories = Array.from(catMap.keys());
    selectedCategories = [...availableCategories];

    const list = document.getElementById('categoryList');
    if (!list) return;
    list.innerHTML = '';

    availableCategories.forEach((cat) => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        checkbox.id = `cat-${cat}`;

        const label = document.createElement('span');
        label.innerText = cat;

        item.appendChild(checkbox);
        item.appendChild(label);

        item.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleCategory(cat);
        });
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleCategory(cat);
        });

        // Keyboard support for dropdown item
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'checkbox');
        item.setAttribute('aria-checked', 'true');
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleCategory(cat);
            }
        });

        list.appendChild(item);
    });

    updateCategoryText();
}

function toggleCategory(category: string) {
    const index = selectedCategories.indexOf(category);
    if (index > -1) {
        selectedCategories.splice(index, 1);
    } else {
        selectedCategories.push(category);
    }

    const checkbox = document.getElementById(`cat-${category}`) as HTMLInputElement;
    if (checkbox) checkbox.checked = selectedCategories.includes(category);

    updateCategoryText();
    applyFilters();
}

function toggleAllCategories(event: Event) {
    const checkbox = document.getElementById('selectAllCats') as HTMLInputElement;
    if (event.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
    }

    const targetState = checkbox.checked;
    if (targetState) {
        selectedCategories = [...availableCategories];
    } else {
        selectedCategories = [];
    }

    document.querySelectorAll('#categoryList input').forEach((cb: Element) => {
        (cb as HTMLInputElement).checked = targetState;
    });

    updateCategoryText();
    applyFilters();
}

function updateCategoryText() {
    const text = document.getElementById('selectedCatText');
    const box = document.getElementById('selectAllCats') as HTMLInputElement;
    if (!text || !box) return;

    if (selectedCategories.length === availableCategories.length) {
        text.textContent = 'All Categories';
        box.checked = true;
    } else if (selectedCategories.length === 0) {
        text.textContent = 'None selected';
        box.checked = false;
    } else {
        text.textContent = `${selectedCategories.length} selected`;
        box.checked = false;
    }
}

function applyFilters(resetToStart = true) {
    filteredSlides = allSlides.filter((slide) => {
        const diffBadge = slide.querySelector('.difficulty-badge')?.textContent;
        const catBadge = slide.querySelector('.category-badge')?.textContent;
        const catBadgeTa = slide.querySelector('.category-badge-ta')?.textContent;
        const catKey = `${catBadge} - ${catBadgeTa}`;

        const difficultyMatch = currentFilter === 'all' || diffBadge === currentFilter;
        const categoryMatch = selectedCategories.includes(catKey);

        return difficultyMatch && categoryMatch;
    });

    if (isShuffled) {
        Utils.shuffleArray(filteredSlides);
    }

    if (resetToStart) currentSlide = 0;
    updateProgress();
    updateUI();
}

function filterDifficulty(difficulty: string) {
    currentFilter = difficulty;
    document.querySelectorAll('.pill-button').forEach((btn) => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });
    const diffBtn = document.getElementById(`filter${difficulty === 'all' ? 'All' : difficulty}`);
    if (diffBtn) {
        diffBtn.classList.add('active');
        diffBtn.setAttribute('aria-pressed', 'true');
    }

    // Ensure active level button styles and ARIA are correct
    // (Actually setTheniLevel re-renders logic or just updates state? Here we just update classes)
    const activeLevelBtn = document.getElementById(`level${currentLevel}`);
    if (activeLevelBtn) {
        activeLevelBtn.classList.add('active');
        activeLevelBtn.setAttribute('aria-pressed', 'true');
    }

    applyFilters();
}

function shuffleSlides() {
    isShuffled = true;
    const btn = document.getElementById('btn-shuffle');
    if (btn) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
    }
    applyFilters();
}

function resetSequence() {
    isShuffled = false;
    const btn = document.getElementById('btn-shuffle');
    if (btn) {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    }
    applyFilters();
}

function updateProgress() {
    const currentFilteredD1 = filteredSlides.filter(
        (s) => s.querySelector('.difficulty-badge')?.textContent === 'D1'
    ).length;
    const currentFilteredD2 = filteredSlides.filter(
        (s) => s.querySelector('.difficulty-badge')?.textContent === 'D2'
    ).length;

    const filterText = currentFilter === 'all' ? 'All Difficulty' : currentFilter;
    const shuffleText = isShuffled ? ' (Shuffled)' : '';

    const progressInfo = document.getElementById('progressInfo');
    if (progressInfo) {
        progressInfo.textContent = `${filteredSlides.length === 0 ? 0 : currentSlide + 1}/${filteredSlides.length} slides - Filter: ${filterText}${shuffleText} (Matches: D1=${currentFilteredD1}, D2=${currentFilteredD2})`;
    }
}

// Level Control
function setTheniLevel(level: number) {
    currentLevel = level;

    // Update Content
    generateSlides();

    // We can assume config is correct or provide fallback
    const timerDuration = level === 4 ? config.timerDurations.theni4 || 15 : config.timerDurations.theni3 || 15;

    // Update Buttons
    document.querySelectorAll('.pill-button').forEach((btn) => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });

    // We should keep the currently selected filter active visually?
    // Let's just activate the correct Level button
    const activeBtn = document.getElementById(`level${level}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.setAttribute('aria-pressed', 'true');
    }

    // And ensure current difficulty filter button is also active
    const diffBtn = document.getElementById(`filter${currentFilter === 'all' ? 'All' : currentFilter}`);
    if (diffBtn) {
        diffBtn.classList.add('active');
        diffBtn.setAttribute('aria-pressed', 'true');
    }

    // Update Timer Label
    const timerLabel = document.getElementById('timerLabel');
    if (timerLabel) {
        timerLabel.textContent = `Timer (${timerDuration}s)`;
    }

    // Update Timer handled by shared module
    Timer.setDuration(timerDuration);

    const check = document.getElementById('showTimer') as HTMLInputElement;
    if (check && check.checked) {
        Timer.restart();
    }

    // Apply filters to new slides
    applyFilters(true);
}

// UI Update
function updateUI() {
    allSlides.forEach((s) => {
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

    (document.getElementById('firstBtn') as HTMLButtonElement).disabled = currentSlide === 0;
    (document.getElementById('prevBtn') as HTMLButtonElement).disabled = currentSlide === 0;
    (document.getElementById('nextBtn') as HTMLButtonElement).disabled = currentSlide === filteredSlides.length - 1;
    (document.getElementById('lastBtn') as HTMLButtonElement).disabled = currentSlide === filteredSlides.length - 1;

    const counter = document.getElementById('counter');
    if (counter) counter.textContent = `${currentSlide + 1} / ${filteredSlides.length}`;

    Utils.updateProgress(currentSlide, filteredSlides.length, 'progressBar', 'counter');
    updateProgress();

    if (filteredSlides[currentSlide]) {
        const slideId = filteredSlides[currentSlide].id.replace('slide-', '');
        const hash = `#${parseInt(slideId) + 1}`;
        if (window.location.hash !== hash) {
            window.history.replaceState(null, '', hash);
        }
    }

    const timerCheck = document.getElementById('showTimer') as HTMLInputElement;
    if (timerCheck && timerCheck.checked) {
        Timer.restart();
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

function changeSlide(direction: number) {
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

    const index = filteredSlides.findIndex((s) => s.id === targetSlideId);
    if (index !== -1) {
        currentSlide = index;
        updateUI();
    } else if (filteredSlides.length > 0) {
        if (currentSlide >= filteredSlides.length) currentSlide = 0;
        updateUI();
    }
}

// Initialization on DOM ready
export function init() {
    Layout.init({
        title: 'பியோரியா தமிழ்ப் பள்ளி - தமிழ்த் தேனி 2026 - Theni 3 & 4',
        contentHTML: `
            <div class="control-row">
                <span class="control-label">Level:</span>
                <div class="pill-group">
                    <button class="pill-button active" id="level3" title="Theni 3: Sentence reading (15s timer)" aria-pressed="true">Theni 3</button>
                    <button class="pill-button" id="level4" title="Theni 4: Advanced reading (40s timer)" aria-pressed="false">Theni 4</button>
                </div>
            </div>
            <div class="control-row">
                <span class="control-label">Categories:</span>
                <div class="category-dropdown">
                    <button class="dropdown-button" id="cat-dropdown-btn" title="Select word categories to display">
                        <span id="selectedCatText">All Categories</span>
                        <span>▼</span>
                    </button>
                    <div class="dropdown-menu" id="categoryMenu">
                        <div class="dropdown-item header" id="select-all-cat-row">
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
                    <button class="pill-button active" id="filterAll" title="Show all difficulty levels (A)" aria-pressed="true">All</button>
                    <button class="pill-button" id="filterD1" title="Show only Difficulty 1 sentences (1)" aria-pressed="false">D1 Only</button>
                    <button class="pill-button" id="filterD2" title="Show only Difficulty 2 sentences (2)" aria-pressed="false">D2 Only</button>
                </div>
            </div>
            <div class="control-row">
                <span class="control-label">Sequence:</span>
                <div class="pill-group">
                    <button class="action-button" id="btn-shuffle" title="Randomize slide order (S)" aria-pressed="false"><span aria-hidden="true">🔀</span> Shuffle</button>
                    <button class="action-button" id="btn-reset-seq" title="Reset to original order (R)"><span aria-hidden="true">↩️</span> Reset</button>
                </div>
                <div style="margin-left: auto; display: flex; gap: 15px;">
                    <label title="Show/hide countdown timer" style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.85em;">
                        <input type="checkbox" id="showTimer" checked> <span id="timerLabel">Timer (15s)</span>
                    </label>
                </div>
            </div>
            <div class="control-row">
                <span class="control-label">Progress:</span>
                <span class="progress-info" id="progressInfo">Loading...</span>
            </div>
        `,
        timerDisplay: '00:15',
        injectNavigation: true,
    });

    // Event Listeners
    document.getElementById('cat-dropdown-btn')?.addEventListener('click', toggleDropdown);
    document.getElementById('select-all-cat-row')?.addEventListener('click', toggleAllCategories);

    document.getElementById('level3')?.addEventListener('click', () => setTheniLevel(3));
    document.getElementById('level4')?.addEventListener('click', () => setTheniLevel(4));

    document.getElementById('filterAll')?.addEventListener('click', () => filterDifficulty('all'));
    document.getElementById('filterD1')?.addEventListener('click', () => filterDifficulty('D1'));
    document.getElementById('filterD2')?.addEventListener('click', () => filterDifficulty('D2'));

    document.getElementById('btn-shuffle')?.addEventListener('click', shuffleSlides);
    document.getElementById('btn-reset-seq')?.addEventListener('click', resetSequence);
    document.getElementById('showTimer')?.addEventListener('change', Timer.toggleVisibility.bind(Timer));

    document.getElementById('firstBtn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        goToFirst();
    });
    document.getElementById('prevBtn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        changeSlide(-1);
    });
    document.getElementById('nextBtn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        handleNextAction();
    });
    document.getElementById('lastBtn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        goToLast();
    });

    document.getElementById('slides-wrapper')?.addEventListener('click', (e) => {
        if (!(e.target as Element).closest('button')) {
            handleNextAction();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') changeSlide(-1);
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
            handleNextAction();
        }
        if (e.key === 'Home' || e.key === '[') goToFirst();
        if (e.key === 'End' || e.key === ']') goToLast();
        if (e.key === '1') filterDifficulty('D1');
        if (e.key === '2') filterDifficulty('D2');
        if (e.key === 'a' || e.key === 'A') filterDifficulty('all');
        if (e.key === 's' || e.key === 'S') shuffleSlides();
        if (e.key === 'r' || e.key === 'R') resetSequence();
    });

    window.addEventListener('hashchange', handleHashChange);

    generateSlides();
    populateCategories();
    // Default to Level 3
    setTheniLevel(3);
    Timer.init(15);
    updateProgress();

    if (window.location.hash) {
        handleHashChange();
    } else {
        updateUI();
    }
}

// Initialization on DOM ready
document.addEventListener('DOMContentLoaded', init);
