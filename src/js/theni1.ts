import { Utils } from './utils';
import { Timer } from './timer';
import { AudioManager } from './audio_manager';
import { Layout } from './layout';
import { config } from './config';
import theniWords from '../data/theni_words.json';
import {
    Word,
    SpeechRecognitionInstance,
    SpeechRecognitionEventResult,
    SpeechRecognitionErrorEventResult,
} from '../types';

// State variables
let currentSlide = 0;
let audioEnabled = true;
let voiceEnabled = false;
let audioTimeout: ReturnType<typeof setTimeout> | null = null;

// Filter and sequence state
let currentFilter = 'all';
let selectedCategories: string[] = [];
let availableCategories: string[] = [];
let allSlides: HTMLDivElement[] = [];
let filteredSlides: HTMLDivElement[] = [];
// let originalOrder = []; // Not used effectively since we rebuild from allSlides
let isShuffled = false;

// Speech Recognition setup
const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition: SpeechRecognitionInstance | null = null;
let isRecording = false;

// Initialize speech recognition
if (SpeechRecognitionClass) {
    recognition = new SpeechRecognitionClass();
    recognition.lang = 'ta-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEventResult) => {
        const speechResult = event.results[0][0].transcript.trim();
        validateVoiceResult(speechResult);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventResult) => {
        if (event.error !== 'no-speech') {
            console.error('Speech recognition error:', event.error);
            showFeedback('Error: ' + event.error, 'error');
        }
        stopRecording();
    };

    recognition.onend = () => {
        if (isRecording) stopRecording();
    };
} else {
    console.warn('Speech recognition not supported.');
}

// Generates slides and keeps them in memory, append to DOM only as needed or all at once?
// Logic was: generate all, append all to #slides-wrapper.
function generateSlides() {
    const wrapper = document.getElementById('slides-wrapper');
    if (!wrapper) {
        console.error('Missing slides-wrapper');
        return;
    }

    wrapper.innerHTML = '';

    (theniWords as Word[]).forEach((item: Word, index: number) => {
        const slide = document.createElement('div');
        slide.className = index === 0 ? 'slide active' : 'slide';
        slide.id = `slide-${index}`;
        slide.style.display = index === 0 ? 'flex' : 'none';

        slide.innerHTML = `
            <div class="image-container">
                <img src="https://placehold.co/400x300?text=Loading..."
                     data-word="${item.image_word}"
                     alt="${item.word_en}"
                     class="slide-image">
            </div>
            <div class="word-row">
                <div class="word-en">${item.word_en}</div>
                <button class="mic-button-inline" id="mic-btn-${index}" title="Voice Validation" aria-label="Start Voice Validation">🎤</button>
                <span class="voice-feedback-inline" role="status" aria-live="polite"></span>
            </div>
            <div class="word-ta">${item.word_ta}</div>
            <div class="card-footer">
                <div class="footer-left">
                    <span class="category-badge">${item.category}</span>
                    <span class="category-badge-ta">${item.category_ta}</span>
                    <span class="difficulty-badge">${item.difficulty}</span>
                </div>
            </div>
        `;

        wrapper.appendChild(slide);

        // Attach event listener directly to mic button
        const micBtn = slide.querySelector(`#mic-btn-${index}`);
        if (micBtn) {
            micBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleVoiceRecognition();
            });
        }
    });

    // Initialize arrays
    allSlides = Array.from(document.querySelectorAll('.slide')) as HTMLDivElement[];
    filteredSlides = [...allSlides];
    // originalOrder = [...allSlides];
}

// Control Panel Toggles
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

// Category Management
function populateCategories() {
    const catMap = new Map();
    allSlides.forEach((slide) => {
        const en = slide.querySelector('.category-badge')?.textContent;
        const ta = slide.querySelector('.category-badge-ta')?.textContent;
        const key = `${en} - ${ta}`;
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

        // Create checkbox and label structure manually to attach events
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        checkbox.id = `cat-${cat}`;

        const label = document.createElement('span');
        label.innerText = cat;

        item.appendChild(checkbox);
        item.appendChild(label);

        // Event for the whole item row
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleCategory(cat);
        });

        // Specific event for checkbox to avoid double trigger if needed, or let bubble handling manage it
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

    // Update ARIA state on parent item if possible, or we rely on checkbox state?
    // Let's find the parent item by ID if we gave it one, or query.
    // Since we didn't give ID to item, we can't easily update aria-checked on div without traversal.
    // But we can iterate.
    const items = document.querySelectorAll('#categoryList .dropdown-item');
    items.forEach((it) => {
        if (it.textContent === category) {
            it.setAttribute('aria-checked', selectedCategories.includes(category).toString());
        }
    });

    updateCategoryText();
    applyFilters();
}

function toggleAllCategories(event: Event) {
    const checkbox = document.getElementById('selectAllCats') as HTMLInputElement;
    // If clicked on div, toggle checkbox manually
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
    updateProgressInfo();
    updateUI();
}

function filterDifficulty(difficulty: string) {
    currentFilter = difficulty;
    document.querySelectorAll('.pill-button').forEach((btn) => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });
    const activeBtn = document.getElementById(`filter${difficulty === 'all' ? 'All' : difficulty}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.setAttribute('aria-pressed', 'true');
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

function updateProgressInfo() {
    const currentFilteredD1 = filteredSlides.filter(
        (s) => s.querySelector('.difficulty-badge')?.textContent === 'D1'
    ).length;
    const currentFilteredD2 = filteredSlides.filter(
        (s) => s.querySelector('.difficulty-badge')?.textContent === 'D2'
    ).length;

    const filterText = currentFilter === 'all' ? 'All Difficulty' : currentFilter;
    const shuffleText = isShuffled ? ' (Shuffled)' : '';

    const info = document.getElementById('progressInfo');
    if (info) {
        info.textContent = `${filteredSlides.length === 0 ? 0 : currentSlide + 1}/${filteredSlides.length} slides - Filter: ${filterText}${shuffleText} (Matches: D1=${currentFilteredD1}, D2=${currentFilteredD2})`;
    }
}

function fetchImage(word: string, imgElement: HTMLImageElement) {
    if (!word) return;

    const safeFilename = word
        .replace(/[^a-zA-Z0-9 \-_]/g, '')
        .trim()
        .replace(/\s+/g, '_');
    const localPath = `assets/images/theni12/${safeFilename}.jpg`; // Assuming path is still valid relative to build

    // Since we are checking if image exists via standard onerror, this logic remains okay.
    // However, in Vite, assets handling is different if we want them hashed.
    // For now, if images are in public/assets/images, this path works.
    // If they are in src/assets/images, we need import.meta.glob or similar.
    // Assuming they are in public/ for dynamic loading:

    // Check if we need to adjust path for base url
    // Check if we need to adjust path for base url
    // console.log('DEBUG: BASE_URL:', import.meta.env.BASE_URL);
    const finalPath = (import.meta.env?.BASE_URL || '') + localPath.replace(/^assets\//, 'assets/');

    imgElement.onerror = function () {
        imgElement.onerror = null;
        // Try fallback to relative path if absolute failed (helpful for some dev environments)
        if (imgElement.src.includes(finalPath)) {
            console.warn(`[ImageLoad] Failed absolute path: ${finalPath}. Retrying with relative...`);
            imgElement.src = `../${localPath}`; // relative to html/ folder
            return;
        }

        console.warn(`Missing local image for: ${word} (${finalPath})`);
        imgElement.src = `https://placehold.co/400x300?text=${encodeURIComponent(word)}`;
    };

    // To handle 'public' folder assets in Vite dev vs prod
    // If in public/assets/..., just /assets/... works if root is set correctly.
    // But localPath above includes 'assets/'.
    // We use finalPath which relies on BASE_URL to be correct in all environments (dev/build).
    imgElement.src = finalPath;
}

// Voice Recognition
function toggleVoiceRecognition() {
    if (!recognition) {
        alert('Speech recognition is not supported in this browser.');
        return;
    }
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

function startRecording() {
    if (!recognition) return;
    try {
        recognition.start();
        isRecording = true;
        const currentElement = filteredSlides[currentSlide];
        const micBtn = currentElement?.querySelector('.mic-button-inline');
        if (micBtn) {
            micBtn.classList.add('recording');
            micBtn.setAttribute('title', 'Voice Validation is ACTIVE - Click to Stop Listening');
        }
        showFeedback('Listening for Tamil...', 'success');
    } catch (e) {
        console.error('Recognition start error:', e);
    }
}

function stopRecording() {
    if (recognition && isRecording) {
        recognition.stop();
    }
    isRecording = false;
    document.querySelectorAll('.mic-button-inline.recording').forEach((btn) => {
        btn.classList.remove('recording');
        btn.setAttribute('title', 'Voice Validation - Click to Start Listening');
    });
}

function validateVoiceResult(spokenText: string) {
    const currentElement = filteredSlides[currentSlide];
    if (!currentElement) return;

    const targetText = currentElement.querySelector('.word-ta')?.textContent?.trim() || '';
    const normalize = (text: string) =>
        text
            .toLowerCase()
            .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
            .replace(/\s+/g, '');

    const normalizedSpoken = normalize(spokenText);
    const normalizedTarget = normalize(targetText);

    if (
        normalizedSpoken === normalizedTarget ||
        normalizedTarget.includes(normalizedSpoken) ||
        normalizedSpoken.includes(normalizedTarget)
    ) {
        showFeedback(`Correct! ✅ (${spokenText})`, 'success');
        currentElement.classList.add('revealed');
    } else {
        showFeedback(`Heard "${spokenText}" ❌`, 'error');
    }

    stopRecording();
}

function showFeedback(text: string, type: string) {
    const currentElement = filteredSlides[currentSlide];
    const feedback = currentElement?.querySelector('.voice-feedback-inline');
    if (!feedback) return;

    feedback.textContent = text;
    feedback.className = `voice-feedback-inline ${type}`;

    if (type !== 'recording' && !text.includes('Listening')) {
        setTimeout(() => {
            if (feedback.textContent === text) {
                feedback.className = 'voice-feedback-inline';
                feedback.textContent = '';
            }
        }, 4000);
    }
}

// Audio/Voice Toggles logic
function toggleAudio() {
    const audioCheckbox = document.getElementById('audioToggle') as HTMLInputElement;
    audioEnabled = audioCheckbox.checked;

    if (audioEnabled) {
        const currentElement = filteredSlides[currentSlide];
        if (currentElement) {
            const wordEn = currentElement.querySelector('.word-en');
            if (wordEn && wordEn.textContent) AudioManager.speak(wordEn.textContent, 'en-US');
        }
    } else {
        if (audioTimeout) clearTimeout(audioTimeout);
        if (AudioManager.synth && AudioManager.synth.speaking) AudioManager.synth.cancel();
    }
}

function toggleVoice() {
    const voiceCheckbox = document.getElementById('voiceToggle') as HTMLInputElement;
    voiceEnabled = voiceCheckbox.checked;

    document.querySelectorAll('.mic-button-inline').forEach((btn: Element) => {
        (btn as HTMLElement).style.display = voiceEnabled ? 'flex' : 'none';
    });

    if (!voiceEnabled) {
        document.querySelectorAll('.voice-feedback-inline').forEach((fb) => {
            fb.textContent = '';
            fb.className = 'voice-feedback-inline';
        });
        stopRecording();
    }
}

// UI Update
function updateUI(shouldSpeak = true) {
    allSlides.forEach((s) => {
        s.classList.remove('active');
        s.style.display = 'none';
        s.style.visibility = 'hidden'; // Ensure hidden completely
    });

    filteredSlides.forEach((s, idx) => {
        s.style.display = idx === currentSlide ? 'flex' : 'none';
        s.style.visibility = idx === currentSlide ? 'visible' : 'hidden'; // Explicit visibility update

        if (idx === currentSlide) {
            s.classList.add('active');

            const img = s.querySelector('.slide-image') as HTMLImageElement;
            if (img && img.dataset.word && !img.dataset.loaded) {
                fetchImage(img.dataset.word, img);
                img.dataset.loaded = 'true';
            }

            const wordEn = s.querySelector('.word-en');
            if (wordEn && wordEn.textContent) {
                if (audioTimeout) clearTimeout(audioTimeout);

                // Speak if enabled explicitly for this update (e.g. navigation)
                if (audioEnabled && shouldSpeak) {
                    audioTimeout = setTimeout(() => {
                        if (audioEnabled && wordEn.textContent) AudioManager.speak(wordEn.textContent, 'en-US');
                    }, 300);
                }
            }

            stopRecording();
        } else {
            s.classList.remove('revealed');
        }
    });

    (document.getElementById('firstBtn') as HTMLButtonElement).disabled = currentSlide === 0;
    (document.getElementById('prevBtn') as HTMLButtonElement).disabled = currentSlide === 0;
    (document.getElementById('nextBtn') as HTMLButtonElement).disabled = currentSlide === filteredSlides.length - 1;
    (document.getElementById('lastBtn') as HTMLButtonElement).disabled = currentSlide === filteredSlides.length - 1;

    Utils.updateProgress(currentSlide, filteredSlides.length, 'progressBar', 'counter');
    updateProgressInfo();

    if ((document.getElementById('showTimer') as HTMLInputElement).checked) {
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

// Navigation Action
// Navigation Action
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

// Initialization
export function init() {
    // 1. Init Layout
    Layout.init({
        title: 'பியோரியா தமிழ்ப் பள்ளி - தமிழ்த் தேனி 2026 - Theni 1',
        contentHTML: `
            <div class="control-row">
                <span class="control-label">Categories:</span>
                <div class="category-dropdown">
                    <button class="dropdown-button" id="cat-dropdown-btn">
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
                <div class="pill-group">
                    <button class="pill-button active" id="filterAll" aria-pressed="true">All</button>
                    <button class="pill-button" id="filterD1" aria-pressed="false">D1 Only</button>
                    <button class="pill-button" id="filterD2" aria-pressed="false">D2 Only</button>
                </div>
                </div>
            </div>
            <div class="control-row">
                <span class="control-label">Sequence:</span>
                <div class="pill-group">
                    <button class="action-button" id="btn-shuffle" aria-pressed="false"><span aria-hidden="true">🔀</span> Shuffle</button>
                    <button class="action-button" id="btn-reset-seq"><span aria-hidden="true">↩️</span> Reset</button>
                </div>
                <div style="margin-left: auto; display: flex; gap: 15px;">
                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.85em;">
                        <input type="checkbox" id="showTimer" checked> ⏱️ Timer (8s)
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.85em;">
                        <input type="checkbox" id="audioToggle" checked> 🔊 Audio
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.85em;">
                        <input type="checkbox" id="voiceToggle"> 🎤 Voice
                    </label>
                </div>
            </div>
            <div class="control-row">
                <span class="control-label">Progress:</span>
                <span class="progress-info" id="progressInfo">Loading...</span>
            </div>
        `,
        timerDisplay: '00:08',
        injectNavigation: true,
    });

    // 2. Attach Event Listeners for Layout Elements
    document.getElementById('cat-dropdown-btn')?.addEventListener('click', toggleDropdown);
    document.getElementById('select-all-cat-row')?.addEventListener('click', toggleAllCategories);

    document.getElementById('filterAll')?.addEventListener('click', () => filterDifficulty('all'));
    document.getElementById('filterD1')?.addEventListener('click', () => filterDifficulty('D1'));
    document.getElementById('filterD2')?.addEventListener('click', () => filterDifficulty('D2'));

    document.getElementById('btn-shuffle')?.addEventListener('click', shuffleSlides);
    document.getElementById('btn-reset-seq')?.addEventListener('click', resetSequence);

    document.getElementById('showTimer')?.addEventListener('change', Timer.toggleVisibility.bind(Timer));
    document.getElementById('audioToggle')?.addEventListener('change', toggleAudio);
    document.getElementById('voiceToggle')?.addEventListener('change', toggleVoice);

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
        // Prevent triggering when clicking buttons or inputs
        if (!(e.target as Element).closest('button, input, .control-panel')) {
            handleNextAction();
        }
    });

    // Global Click Listener for Dropdowns
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

    // Keyboard controls
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

    // Hash change
    window.addEventListener('hashchange', handleHashChange);

    // 3. Logic Init
    generateSlides();
    populateCategories();
    Timer.init(config.timerDurations.theni1);
    updateProgressInfo();

    if (window.location.hash) {
        handleHashChange();
    } else {
        updateUI(true); // Audio enabled on load
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', init);
