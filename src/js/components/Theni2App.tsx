import { Fragment } from 'preact';
import { useState, useEffect, useMemo, useCallback } from 'preact/hooks';
import { Word } from '../../types/index';
import theniWords from '../../data/theni_words.json';
import { Utils } from '../utils';
import { AudioManager } from '../audio_manager';
import { Timer } from '../timer';
import { SentenceConstructorAgent } from '../agents/sentence_agent';
import { Controls } from './Controls';
import confetti from 'canvas-confetti';

const sentenceAgent = new SentenceConstructorAgent();

// --- Sub-components ---

const Card = ({ word, side, show }: { word: Word | null, side: 1 | 2, show: boolean }) => {
    const [imgSrc, setImgSrc] = useState<string>('https://placehold.co/300x180?text=Loading...');

    useEffect(() => {
        if (!word) {
            setImgSrc('');
            return;
        }

        const keyword = word.image_word || word.word_en.toLowerCase();
        const path = Utils.getImagePath(keyword);

        const img = new Image();
        img.onload = () => setImgSrc(path);
        img.onerror = () => setImgSrc(`https://placehold.co/300x180?text=${encodeURIComponent(word.word_en)}`);
        img.src = path;

    }, [word]);

    if (!word) return <div class="dual-word-card" />;

    const handleSpeak = (e: any) => {
        e.stopPropagation();
        AudioManager.speak(word.word_en, 'en-US');
    };


    return (
        <div className={`dual-word-card ${show ? 'revealed' : ''}`} id={`card${side}`}>
            <div className="card-image">
                <img id={`card${side}Img`} src={imgSrc} alt={word.word_en} />
                <button className="speaker-button-overlay" onClick={handleSpeak} title="Speak English">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                </button>
            </div>
            <div className="word-en" id={`card${side}En`}>{word.word_en}</div>
            <div className="word-ta" id={`card${side}Ta`}>
                {word.word_ta}
            </div>
            <div className="card-footer-badges">
                <span className="card-badge category-label">{word.category}</span>
                <span className="card-badge category-label-ta">{word.category_ta}</span>
                <span className="card-badge difficulty-label">{word.difficulty}</span>
            </div>
        </div>
    );
};

// --- Sub-components ---

// ... (Sub-components) ...

// Remove old local Controls implementation

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
    const [currentIndex, setCurrentIndex] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('GEMINI_API_KEY') || '');

    // AI State
    const [aiStatus, setAiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [aiResult, setAiResult] = useState<{ tamil: string, en: string } | null>(null);
    const [lastAiError, setLastAiError] = useState('');

    // Settings
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [showTimer, setShowTimer] = useState(true);

    // Derived State
    const [filteredWords, setFilteredWords] = useState<Word[]>([]);

    const partnerMap = useMemo(() => {
        const map = new Map<number, number>();
        const len = filteredWords.length;
        if (len === 0) return map;

        // Create a list of all indices
        const allIndices = Array.from({ length: len }, (_, i) => i);

        // For each index, pick a random partner that isn't itself
        for (let i = 0; i < len; i++) {
            if (len <= 1) {
                map.set(i, i);
                continue;
            }

            // Filter out current index
            const possiblePartners = allIndices.filter(idx => idx !== i);
            const randomPartner = possiblePartners[Math.floor(Math.random() * possiblePartners.length)];
            map.set(i, randomPartner);
        }
        return map;
    }, [filteredWords]);

    useEffect(() => {
        let result = allWords.filter((w: Word) => {
            const catKey = `${w.category} - ${w.category_ta}`;
            return selectedCategories.includes(catKey) && (difficulty === 'all' || w.difficulty === difficulty);
        });
        if (shuffle) Utils.shuffleArray(result);
        setFilteredWords(result);
        setCurrentIndex(0);
        setRevealed(false);
        // Clear AI state on filter change
        setAiStatus('idle');
        setAiResult(null);
        setLastAiError('');
    }, [selectedCategories, difficulty, shuffle, allWords]);

    const currentWord = filteredWords[currentIndex];
    const partnerIndex = currentWord ? partnerMap.get(currentIndex) ?? 0 : 0;
    const partnerWord = filteredWords[partnerIndex];

    const generateSentence = async () => {
        if (!currentWord || !partnerWord) return;
        setAiStatus('loading');
        try {
            const result = await sentenceAgent.generateSentence(currentWord, partnerWord, apiKey);
            setAiResult(result);
            setAiStatus('success');
        } catch (e: any) {
            setLastAiError(e.message);
            setAiStatus('error');
        }
    };

    const handleNext = useCallback(() => {
        if (currentIndex < filteredWords.length - 1) {
            setCurrentIndex((v: number) => v + 1);
            setRevealed(false);
            setAiStatus('idle');
            setAiResult(null);
        } else {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }
    }, [currentIndex, filteredWords]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex((v: number) => v - 1);
            setRevealed(false);
            setAiStatus('idle');
            setAiResult(null);
        }
    }, [currentIndex]);

    const handleGoFirst = useCallback(() => {
        setCurrentIndex(0);
        setRevealed(false);
        setAiStatus('idle');
        setAiResult(null);
    }, []);

    const handleGoLast = useCallback(() => {
        setCurrentIndex(filteredWords.length - 1);
        setRevealed(false);
        setAiStatus('idle');
        setAiResult(null);
    }, [filteredWords]);

    const handleAction = () => {
        if (!revealed) setRevealed(true);
        else handleNext();
    };

    // Keyboard Navigation
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement) return;
            switch (e.key) {
                case 'ArrowLeft': handlePrev(); break;
                case 'ArrowRight': handleAction(); break;
                case ' ': e.preventDefault(); handleAction(); break;
                case 'Enter': handleAction(); break;
                case 'Home': case '[': handleGoFirst(); break;
                case 'End': case ']': handleGoLast(); break;
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handleNext, handlePrev, handleGoFirst, handleGoLast, revealed]);

    // --- Timer & Audio Integrations ---

    // 1. Timer Init
    useEffect(() => {
        setTimeout(() => Timer.init(20), 100);
    }, []);

    // 2. Timer Restart on Slide Change
    useEffect(() => {
        if (showTimer) Timer.restart();
    }, [currentIndex, showTimer]);

    // 3. Timer Visibility
    useEffect(() => {
        const pill = document.getElementById('timerPill');
        if (showTimer) {
            pill?.style.removeProperty('display');
        } else {
            if (pill) pill.style.display = 'none';
        }
    }, [showTimer]);

    // 4. Audio Playback (Speaks both words English with a gap)
    useEffect(() => {
        if (audioEnabled && currentWord && partnerWord) {
            let t2: ReturnType<typeof setTimeout>;
            const t1 = setTimeout(() => {
                if (audioEnabled) {
                    AudioManager.speak(currentWord.word_en, 'en-US');
                    // We estimate duration + 1s gap. Most words are < 1s. So 2s total is safe.
                    // Reduced delay for sequential words to ~0.5s gap
                    t2 = setTimeout(() => {
                        if (audioEnabled) {
                            AudioManager.speak(partnerWord.word_en, 'en-US');
                        }
                    }, 1200);
                }
            }, 500);
            return () => {
                clearTimeout(t1);
                if (t2) clearTimeout(t2);
            };
        }
    }, [currentIndex, partnerIndex, audioEnabled]);

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
                timerLabel="Timer (20s)"
                progressText={`${currentIndex + 1}/${filteredWords.length} slides - Filter: ${difficulty} ${shuffle ? '(Shuffled)' : ''}`}
                apiKey={apiKey}
                setApiKey={setApiKey}
            />

            <div className="slide-container">
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
                <div className="dual-view-container" id="slides-wrapper" onClick={handleAction} style={{ cursor: 'pointer' }}>
                    <Card word={currentWord} side={1} show={revealed} />
                    <Card word={partnerWord} side={2} show={revealed} />
                </div>

                {/* Navigation - Standardized */}
                <div className="navigation">
                    <button id="firstBtn" className="nav-btn" onClick={e => { e.stopPropagation(); handleGoFirst(); }} disabled={currentIndex === 0} title="First Slide (Home)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>
                    </button>
                    <button id="prevBtn" className="nav-btn" onClick={e => { e.stopPropagation(); handlePrev(); }} disabled={currentIndex === 0} title="Previous Slide (←)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>

                    <span className="slide-counter" id="counter">
                        {currentIndex + 1} / {filteredWords.length}
                    </span>

                    <button id="nextBtn"
                        className={`nav-btn ${!revealed ? 'reveal-mode' : ''}`}
                        onClick={e => { e.stopPropagation(); handleAction(); }}
                        disabled={currentIndex === filteredWords.length - 1 && revealed}
                        title={!revealed ? "Reveal (Space/Enter)" : "Next Slide (→)"}
                    >
                        {!revealed ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        )}
                    </button>

                    <button id="lastBtn" className="nav-btn" onClick={e => { e.stopPropagation(); handleGoLast(); }} disabled={currentIndex === filteredWords.length - 1} title="Last Slide (End)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
                    </button>
                </div>
            </div>

        </Fragment>
    );
}
