import { Utils } from './utils';
import { Timer } from './timer';
import { Layout } from './layout';
import { config } from './config';
import theni5Words from '../data/theni5_words.json';
import { Theni5Word } from '../types';



// Assuming we have theni5Words exported or we need to define them.
// The original `theni5.ts` referenced `window.theni5Words`.
// We should probably convert that data file to a module too, but if it's large and specific to Theni5, 
// maybe we can keep it or expect it locally. 
// For now, let's assume `window.theni5Words` is populated by another script OR we fetch it.
// To be clean, we should probably fetch it or import it.
// Let's assume there is a `theni5_words.ts` similar to `theni_words.ts` or we fetch it.
// If it's not present, we will fallback to empty array or try to read from window if strictly needed (with typecast).
// But for modularity, let's assume we import `theni5Words` if possible. 
// Since I don't see `theni5_words.ts` in file list, I will cast window for now to avoid breaking if data file isn't converted yet. 
// Ideally I would convert that too. 

const rawWords: Theni5Word[] = theni5Words || [];
let activeWords = [...rawWords];
let currentSlide = 0;
let totalPages = 50; // Initial default

function init() {
    updateSlideRange();
    Timer.init(config.timerDurations.theni5);
    renderSlide();

    // Event Listeners
    document.addEventListener('keydown', (e) => {
        if ((e.target as HTMLElement).tagName === 'INPUT') return;
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') nextSlide();
        if (e.key === 'Home') goToSlide(0);
        if (e.key === 'End') goToSlide(totalPages - 1);
    });

    document.addEventListener('click', (e) => {
        const panel = document.getElementById('controlPanel');
        if (!panel) return;

        const isClickInsidePanel = panel.contains(e.target as Node);
        const target = e.target as HTMLElement;
        const isActionBtn = target.closest('button') || target.closest('input') || target.closest('a');

        if (isActionBtn) return;

        const wasCollapsed = panel.classList.contains('collapsed');

        if (!isClickInsidePanel) {
            panel.classList.add('collapsed');
            document.body.classList.remove('panel-expanded');
        }

        // Interaction for slide advancement
        if (target.closest('#slide-surface')) {
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
    const startInput = document.getElementById('startRange') as HTMLInputElement;
    const endInput = document.getElementById('endRange') as HTMLInputElement;

    const start = parseInt(startInput?.value) || 1;
    const end = parseInt(endInput?.value) || 250;

    activeWords = rawWords.filter(w => w.s >= start && w.s <= end);
    totalPages = Math.ceil(activeWords.length / 5);
    currentSlide = 0;
    renderSlide();
}

function renderSlide() {
    const grid = document.getElementById('wordsGrid');
    if (!grid) return;
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

    // Restart timer if enabled
    const timerCheck = document.getElementById('showTimer') as HTMLInputElement;
    if (timerCheck && timerCheck.checked) {
        Timer.restart();
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

function goToSlide(idx: number) {
    currentSlide = Math.max(0, Math.min(idx, totalPages - 1));
    renderSlide();
}

function updateUI() {
    Utils.updateProgress(currentSlide, totalPages, 'progressBar', 'counter');

    (document.getElementById('prevBtn') as HTMLButtonElement).disabled = currentSlide === 0;
    (document.getElementById('nextBtn') as HTMLButtonElement).disabled = (currentSlide === totalPages - 1);
    (document.getElementById('firstBtn') as HTMLButtonElement).disabled = currentSlide === 0;
    (document.getElementById('lastBtn') as HTMLButtonElement).disabled = currentSlide === totalPages - 1;
}

function shuffleWords() {
    Utils.shuffleArray(activeWords);
    currentSlide = 0;
    renderSlide();
}

function resetWords() {
    const startInput = document.getElementById('startRange') as HTMLInputElement;
    const endInput = document.getElementById('endRange') as HTMLInputElement;

    const start = parseInt(startInput?.value) || 1;
    const end = parseInt(endInput?.value) || 250;

    activeWords = rawWords.filter(w => w.s >= start && w.s <= end);
    currentSlide = 0;
    renderSlide();
}

function applyFilters() {
    updateSlideRange();
}

// Timer logic
export function setTimerDuration(seconds: number) {
    // Update pill button states
    document.querySelectorAll('#timer30, #timer60, #timer120').forEach(btn => btn.classList.remove('active'));
    // Theni 5 might not have these specific buttons in this layout implementation but keeping logic generic
    // Actually looking at init layout, it doesn't have custom timer duration buttons exposed in the contentHTML I wrote below?
    // Oh, I should probably add them if they are needed, or rely on default config.
    // The original code had logic for `window.setTimerDuration`.

    // Let's implement setDuration call
    Timer.setDuration(seconds);
    const check = document.getElementById('showTimer') as HTMLInputElement;
    if (check && check.checked) {
        Timer.restart();
    }
}

// Initialization and Event Listeners
export function initAll() {
    Layout.init({
        title: "Theni 5 Mastery",
        contentHTML: `
             <div class="control-row">
                <span class="control-label">Range:</span>
                <input type="number" id="startRange" value="1" min="1" max="250" style="width: 70px; padding: 5px; border-radius: 4px; border: 1px solid #ddd;">
                <span style="margin: 0 10px;">to</span>
                <input type="number" id="endRange" value="250" min="1" max="250" style="width: 70px; padding: 5px; border-radius: 4px; border: 1px solid #ddd;">
                <button class="action-button" id="applyBtn" style="margin-left: 10px;">Apply</button>
            </div>
            <div class="control-row">
                <span class="control-label">Actions:</span>
                <button class="action-button" id="shuffleBtn"><span>🔀</span> Shuffle</button>
                <button class="action-button" id="resetBtn"><span>↩️</span> Reset</button>
                <div style="margin-left: auto; display: flex; gap: 15px;">
                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.85rem;">
                        <input type="checkbox" id="showTimer" checked> Timer (1m)
                    </label>
                </div>
            </div>
        `,
        timerDisplay: "01:00",
        injectNavigation: true
    });

    // Event Listeners
    document.getElementById('applyBtn')?.addEventListener('click', applyFilters);
    document.getElementById('shuffleBtn')?.addEventListener('click', shuffleWords);
    document.getElementById('resetBtn')?.addEventListener('click', resetWords);
    document.getElementById('showTimer')?.addEventListener('change', Timer.toggleVisibility.bind(Timer));

    document.getElementById('firstBtn')?.addEventListener('click', (e) => { e.stopPropagation(); goToSlide(0); });
    document.getElementById('prevBtn')?.addEventListener('click', (e) => { e.stopPropagation(); prevSlide(); });
    document.getElementById('nextBtn')?.addEventListener('click', (e) => { e.stopPropagation(); nextSlide(); });
    document.getElementById('lastBtn')?.addEventListener('click', (e) => { e.stopPropagation(); goToSlide(totalPages - 1); });

    init();
}

// Initialization and Event Listeners
document.addEventListener('DOMContentLoaded', initAll);
