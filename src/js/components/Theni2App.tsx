import { Fragment } from 'preact';
import { useState, useEffect, useMemo, useCallback } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import { Word } from '../../types';
import theniWords from '../../data/theni_words.json';
import { Utils } from '../utils';
import { AudioManager } from '../audio_manager';
import { Timer } from '../timer';
import { SentenceConstructorAgent } from '../agents/sentence_agent';
import confetti from 'canvas-confetti';

// --- Sub-components ---

const Card = ({ word, side, show }: { word: Word | null, side: 1 | 2, show: boolean }) => {
    const [imgSrc, setImgSrc] = useState<string>('https://placehold.co/300x180?text=Loading...');

    useEffect(() => {
        if (!word) {
            setImgSrc('');
            return;
        }

        // Image logic
        const keyword = word.image_word || word.word_en.toLowerCase();
        const path = Utils.getImagePath(keyword);

        // Simple validity check or let browser handle error
        const img = new Image();
        img.onload = () => setImgSrc(path);
        img.onerror = () => setImgSrc(`https://placehold.co/300x180?text=${encodeURIComponent(word.word_en)}`);
        img.src = path;

    }, [word]);

    if (!word) return <div class="dual-word-card" />;

    return (
        <div className={`dual-word-card ${show ? 'revealed' : ''}`} id={`card${side}`}>
            <div className="card-image">
                <img id={`card${side}Img`} src={imgSrc} alt={word.word_en} />
            </div>
            <div className="word-en" id={`card${side}En`}>{word.word_en}</div>
            <div className="word-ta" id={`card${side}Ta`}>{word.word_ta}</div>
            <div className="card-footer-badges">
                <span className="card-badge category-label">{word.category}</span>
                <span className="card-badge category-label-ta">{word.category_ta}</span>
                <span className="card-badge difficulty-label">{word.difficulty}</span>
            </div>
        </div>
    );
};

const Controls = ({
    categories,
    selectedCategories,
    onToggleCategory,
    onToggleAllCategories,
    difficulty,
    setDifficulty,
    shuffle,
    setShuffle,
    reset,
    audioEnabled,
    setAudioEnabled,
    showTimer,
    setShowTimer,
    progressText,
    apiKey,
    setApiKey
}: any) => {
    const portalTarget = document.getElementById('controlSettings') || document.getElementById('controlContent');
    if (!portalTarget) return null;

    return createPortal(
        <Fragment>
            <div className="control-row">
                <span className="control-label">Categories:</span>
                <div className="category-dropdown">
                    <button className="dropdown-button" id="cat-dropdown-btn"
                        onClick={(e) => { e.stopPropagation(); document.getElementById('categoryMenu')?.classList.toggle('show'); }}
                        title="Select word categories to display">
                        <span id="selectedCatText">
                            {selectedCategories.length === categories.length ? 'All Categories' :
                                selectedCategories.length === 0 ? 'None selected' :
                                    `${selectedCategories.length} selected`}
                        </span>
                        <span>▼</span>
                    </button>
                    <div className="dropdown-menu" id="categoryMenu" onClick={(e) => e.stopPropagation()}>
                        <div className="dropdown-item header" id="select-all-cat-row" onClick={onToggleAllCategories}>
                            <input type="checkbox" id="selectAllCats" checked={selectedCategories.length === categories.length} readOnly />
                            <span>Select All / None</span>
                        </div>
                        <div id="categoryList">
                            {categories.map((cat: string) => {
                                const isSelected = selectedCategories.includes(cat);
                                return (
                                    <div className="dropdown-item" key={cat} onClick={() => onToggleCategory(cat)}>
                                        <input type="checkbox" checked={isSelected} readOnly />
                                        <span>{cat}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="control-row">
                <span className="control-label">Difficulty:</span>
                <div className="pill-group">
                    <button className={`pill-button ${difficulty === 'all' ? 'active' : ''}`} onClick={() => setDifficulty('all')} id="filterAll">All</button>
                    <button className={`pill-button ${difficulty === 'D1' ? 'active' : ''}`} onClick={() => setDifficulty('D1')} id="filterD1">D1 Only</button>
                    <button className={`pill-button ${difficulty === 'D2' ? 'active' : ''}`} onClick={() => setDifficulty('D2')} id="filterD2">D2 Only</button>
                </div>
            </div>

            <div className="control-row">
                <span className="control-label">Sequence:</span>
                <div className="pill-group">
                    <button className={`action-button ${shuffle ? 'active' : ''}`} onClick={() => setShuffle(!shuffle)} id="btn-shuffle">
                        <span aria-hidden="true">🔀</span> Shuffle
                    </button>
                    <button className="action-button" onClick={reset} id="btn-reset-seq">
                        <span aria-hidden="true">↩️</span> Reset
                    </button>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85em' }}>
                        <input type="checkbox" checked={showTimer} onChange={(e) => setShowTimer(e.currentTarget.checked)} /> ⏱️ Timer (20s)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85em' }}>
                        <input type="checkbox" checked={audioEnabled} onChange={(e) => setAudioEnabled(e.currentTarget.checked)} /> 🔊 Audio
                    </label>
                </div>
            </div>

            <div className="control-row">
                <span className="control-label">Progress:</span>
                <span className="progress-info" id="progressInfo">{progressText}</span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.85em', display: 'flex', alignItems: 'center', gap: '6px' }}>🔑 Gemini AI API:</label>
                    <input type="password" id="apiKeyInput" placeholder="Enter API Key" value={apiKey} onChange={(e) => setApiKey(e.currentTarget.value)}
                        style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '0.85em', width: '140px' }} />
                </div>
            </div>
        </Fragment>,
        portalTarget
    );
}

// --- Main App ---

export default function Theni2App() {
    // Data
    const allWords = useMemo(() => theniWords as Word[], []);
    const categories = useMemo(() => {
        const cats = new Set<string>();
        allWords.forEach(w => cats.add(`${w.category} - ${w.category_ta}`));
        return Array.from(cats);
    }, [allWords]);

    // State
    const [selectedCategories, setSelectedCategories] = useState<string[]>(() => [...categories]);
    const [difficulty, setDifficulty] = useState<'all' | 'D1' | 'D2'>('all');
    const [shuffle, setShuffle] = useState(false);

    // Filtered Content - Initialize synchronously
    const [filteredWords, setFilteredWords] = useState<Word[]>(() => [...allWords]);

    const [currentIndex, setCurrentIndex] = useState(0);
    // Initialize partner index synchronously
    const [partnerIndex, setPartnerIndex] = useState<number | null>(() => {
        if (allWords.length < 2) return null;
        let rnd;
        let attempts = 0;
        do {
            rnd = Math.floor(Math.random() * allWords.length);
            attempts++;
        } while (rnd === 0 && attempts < 20); // 0 is initial currentIndex
        return rnd;
    });
    const [viewedPartners, setViewedPartners] = useState<Record<number, number>>({});

    const [revealed, setRevealed] = useState(false);

    // Settings
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [showTimer, setShowTimer] = useState(true);
    const [apiKey, setApiKey] = useState('');

    // AI
    const [aiStatus, setAiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [aiResult, setAiResult] = useState<{ tamil: string, en: string } | null>(null);
    const [lastAiError, setLastAiError] = useState<string>('');

    // Agents
    const sentenceAgent = useMemo(() => new SentenceConstructorAgent(), []);

    // Init
    useEffect(() => {
        // Load API Key
        const savedKey = localStorage.getItem('gemini_api_key');
        if (savedKey) setApiKey(savedKey);

        // Timer Init - wait for DOM
        setTimeout(() => Timer.init(20), 100);
    }, []);

    // Save API Key
    useEffect(() => {
        if (apiKey) localStorage.setItem('gemini_api_key', apiKey);
    }, [apiKey]);

    // Timer Visibility
    useEffect(() => {
        if (showTimer) {
            document.getElementById('timerPill')?.style.removeProperty('display');
        } else {
            const pill = document.getElementById('timerPill');
            if (pill) pill.style.display = 'none';
        }
    }, [showTimer]);

    // Apply Filters
    useEffect(() => {
        let result = allWords.filter(w => {
            const catKey = `${w.category} - ${w.category_ta}`;
            const matchesCat = selectedCategories.includes(catKey);
            const matchesDiff = difficulty === 'all' || w.difficulty === difficulty;
            return matchesCat && matchesDiff;
        });

        if (shuffle) {
            Utils.shuffleArray(result);
        }

        setFilteredWords(result);
        setCurrentIndex(0);
        setViewedPartners({});
        setRevealed(false);
        setAiStatus('idle');
        setAiResult(null);
    }, [selectedCategories, difficulty, shuffle, allWords]);

    // Navigation & Logic
    const currentWord = filteredWords[currentIndex];

    // Determine Partner
    useEffect(() => {
        if (!currentWord || filteredWords.length < 2) {
            setPartnerIndex(null);
            return;
        }

        if (viewedPartners[currentIndex] !== undefined) {
            setPartnerIndex(viewedPartners[currentIndex]);
        } else {
            let rnd;
            let attempts = 0;
            do {
                rnd = Math.floor(Math.random() * filteredWords.length);
                attempts++;
            } while (rnd === currentIndex && attempts < 20);

            setPartnerIndex(rnd);
            setViewedPartners(prev => ({ ...prev, [currentIndex]: rnd }));
        }

        // Restart timer
        if (showTimer) Timer.restart();

    }, [currentIndex, filteredWords, viewedPartners, showTimer]);

    const partnerWord = partnerIndex !== null ? filteredWords[partnerIndex] : null;

    // Progress Bar
    useEffect(() => {
        Utils.updateProgress(currentIndex, filteredWords.length, 'progressBar', 'counter');
    }, [currentIndex, filteredWords]);


    // Confetti on Completion
    useEffect(() => {
        if (filteredWords.length > 0 && currentIndex === filteredWords.length - 1 && revealed) {
            // Wait a moment for the user to realize they finished?
            // Or immediate gratification? Immediate is usually better for "unlocking" the end.

            // Fire a burst
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            // Maybe a second burst for fun?
            setTimeout(() => {
                confetti({
                    particleCount: 50,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 }
                });
                confetti({
                    particleCount: 50,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 }
                });
            }, 250);
        }
    }, [currentIndex, filteredWords.length, revealed]);


    // Actions
    const handleNext = useCallback(() => {
        if (currentIndex < filteredWords.length - 1) {
            setCurrentIndex(c => c + 1);
            setRevealed(false);
            setAiStatus('idle');
            setAiResult(null);
        }
    }, [currentIndex, filteredWords]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(c => c - 1);
            setRevealed(false);
            setAiStatus('idle');
            setAiResult(null);
        }
    }, [currentIndex]);

    const handleGoFirst = useCallback(() => setCurrentIndex(0), []);
    const handleGoLast = useCallback(() => setCurrentIndex(filteredWords.length - 1), []);

    const handleAction = useCallback(() => {
        if (!revealed) {
            setRevealed(true);
        } else {
            handleNext();
        }
    }, [revealed, handleNext]);


    // AI Generation
    const generateSentence = async () => {
        if (!currentWord || !partnerWord) return;
        if (!apiKey) {
            alert('Please enter API Key in settings');
            const panel = document.getElementById('controlPanel');
            panel?.classList.remove('collapsed');
            return;
        }

        Timer.pause();
        setAiStatus('loading');

        try {
            const resp = await sentenceAgent.generateSentence(currentWord.word_ta, partnerWord.word_ta, apiKey);
            setAiResult({ tamil: resp.tamil, en: resp.english });
            setAiStatus('success');

            if (audioEnabled) {
                AudioManager.speak(resp.tamil, 'ta-IN');
            }
        } catch (e: any) {
            console.error(e);
            setLastAiError(e.message || 'Unknown Error');
            setAiStatus('error');
        }
    };

    // Audio Playback Effect
    useEffect(() => {
        if (audioEnabled && currentWord && partnerWord) {
            AudioManager.speak(currentWord.word_en, 'en-US');
            setTimeout(() => {
                // Check if still mounted and same index?? Effect cleanup handles this?
                // Simple timeout might fire after move.
                if (audioEnabled) AudioManager.speak(partnerWord.word_en, 'en-US');
            }, 1500);
        }
    }, [currentIndex, audioEnabled, currentWord, partnerWord]);

    // Keyboard
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if ((e.target as HTMLElement).tagName === 'INPUT') return;

            switch (e.key) {
                case 'ArrowLeft': handlePrev(); break;
                case 'ArrowRight': handleAction(); break;
                case ' ': e.preventDefault(); handleAction(); break;
                case 'Enter': handleAction(); break;
                case 'Home': case '[': handleGoFirst(); break;
                case 'End': case ']': handleGoLast(); break;
                case '1': setDifficulty('D1'); break;
                case '2': setDifficulty('D2'); break;
                case 'a': case 'A': setDifficulty('all'); break;
                case 's': case 'S': setShuffle(s => !s); break;
                case 'r': case 'R': setShuffle(false); setDifficulty('all'); break; // Reset
                case 'g': case 'G': generateSentence(); break;
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handlePrev, handleAction, handleGoFirst, handleGoLast]);


    // Portal for Navigation Buttons (injecting into Layout's nav or replacing logic?)
    // Layout creates #firstBtn, #prevBtn etc.
    // I should create a Portal to wire them up OR just attach listeners?
    // Attaching listeners in Preact is weird.
    // Better: Render my OWN navigation into the nav container if it exists.

    // For now, let's use a Ref/Effect to bind to the existing DOM elements created by Layout.ts
    // This bridges the gap between Vanilla Layout and Preact Logic
    useEffect(() => {
        const bind = (id: string, fn: () => void) => {
            const el = document.getElementById(id);
            if (el) {
                el.onclick = (e) => { e.stopPropagation(); fn(); };
                // Update disabled state
                if (id === 'firstBtn' || id === 'prevBtn') (el as HTMLButtonElement).disabled = currentIndex === 0;
                if (id === 'nextBtn' || id === 'lastBtn') (el as HTMLButtonElement).disabled = currentIndex === filteredWords.length - 1;
            }
        };
        bind('firstBtn', handleGoFirst);
        bind('prevBtn', handlePrev);
        bind('nextBtn', handleAction); // Next btn does "Action" (Reveal/Next)
        bind('lastBtn', handleGoLast);
    }, [currentIndex, filteredWords.length, handleAction, handleGoFirst, handleGoLast, handlePrev]);


    // Render

    if (filteredWords.length === 0) return <div style={{ color: 'white', padding: 20 }}>No words found for filters.</div>;

    return (
        <Fragment>
            <Controls
                categories={categories}
                selectedCategories={selectedCategories}
                onToggleCategory={(c: string) => setSelectedCategories(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])}
                onToggleAllCategories={() => setSelectedCategories(selectedCategories.length === categories.length ? [] : [...categories])}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                shuffle={shuffle}
                setShuffle={setShuffle}
                reset={() => { setShuffle(false); setDifficulty('all'); setSelectedCategories([...categories]); }}
                audioEnabled={audioEnabled}
                setAudioEnabled={setAudioEnabled}
                showTimer={showTimer}
                setShowTimer={setShowTimer}
                progressText={`${currentIndex + 1}/${filteredWords.length} slides - Filter: ${difficulty} ${shuffle ? '(Shuffled)' : ''}`}
                apiKey={apiKey}
                setApiKey={setApiKey}
            />

            {/* AI Section */}
            <div className="ai-section">
                <button className="ai-btn" id="aiBtn" onClick={generateSentence} disabled={aiStatus === 'loading'}>
                    <span>{aiStatus === 'loading' ? '⏳' : '✨'}</span> {aiStatus === 'loading' ? 'Generating...' : 'Generate Sentence'}
                </button>

                <div className={`ai-result-box ${aiStatus === 'success' || aiStatus === 'error' ? 'show' : ''}`}
                    style={{ display: aiStatus === 'idle' ? 'none' : 'flex', borderLeftColor: aiStatus === 'error' ? 'red' : '#667eea' }}>
                    {aiStatus === 'error' ? (
                        <div style={{ color: 'red' }}>{lastAiError}</div>
                    ) : (
                        <Fragment>
                            <div className="ai-text-ta">{aiResult?.tamil}</div>
                            <div className="ai-text-en">{aiResult?.en}</div>
                        </Fragment>
                    )}
                </div>
            </div>

            {/* Cards */}
            <div className="dual-view-container">
                <Card word={currentWord} side={1} show={revealed} />
                <Card word={partnerWord} side={2} show={revealed} />
            </div>

        </Fragment>
    );
}
