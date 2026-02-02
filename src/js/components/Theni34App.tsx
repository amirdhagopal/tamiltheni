import { Fragment } from 'preact';
import { useState, useEffect, useMemo, useCallback } from 'preact/hooks';
import { Controls } from './Controls';
import { Utils } from '../utils';
import { Timer } from '../timer';
import { config } from '../config';
import theniWords from '../../data/theni_words.json';
import { Word } from '../../types/index';
import confetti from 'canvas-confetti';

export default function Theni34App() {
    // Data
    const allWords = useMemo(() => theniWords as Word[], []);
    const categories = useMemo(() => {
        const cats = new Set<string>();
        allWords.forEach(w => cats.add(`${w.category} - ${w.category_ta}`));
        return Array.from(cats);
    }, [allWords]);

    // State
    const [level, setLevel] = useState(3); // Level 3 or 4
    const [selectedCategories, setSelectedCategories] = useState<string[]>(() => [...categories]);
    const [difficulty, setDifficulty] = useState<'all' | 'D1' | 'D2'>('all');
    const [shuffle, setShuffle] = useState(false);

    // Derived
    const [filteredWords, setFilteredWords] = useState<Word[]>(() => [...allWords]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [revealed, setRevealed] = useState(false);

    // Settings
    const [showTimer, setShowTimer] = useState(true);

    // Init & Level Change Logic
    useEffect(() => {
        const duration = level === 4 ? (config.timerDurations.theni4 || 15) : (config.timerDurations.theni3 || 15);
        Timer.init(duration);
        if (showTimer) Timer.restart();
    }, [level, showTimer]);

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
        setRevealed(false);
    }, [selectedCategories, difficulty, shuffle, allWords, level]); // Level triggers re-filter conceptually even if using exact same words

    const currentWord = filteredWords[currentIndex];
    const timerLabel = `Timer (${level === 3 ? '15s' : '40s'})`; // Simplified label update

    // Progress
    useEffect(() => {
        Utils.updateProgress(currentIndex, filteredWords.length, 'progressBar', 'counter');
    }, [currentIndex, filteredWords]);

    // Actions
    const handleNext = useCallback(() => {
        if (currentIndex < filteredWords.length - 1) {
            setCurrentIndex(c => c + 1);
            setRevealed(false);
        }
    }, [currentIndex, filteredWords]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(c => c - 1);
            setRevealed(false);
        }
    }, [currentIndex]);

    const handleGoFirst = useCallback(() => {
        setCurrentIndex(0);
        setRevealed(false);
    }, []);

    const handleGoLast = useCallback(() => {
        setCurrentIndex(filteredWords.length - 1);
        setRevealed(false);
    }, [filteredWords]);

    const handleAction = useCallback(() => {
        if (!revealed) {
            setRevealed(true);
            // Confetti check
            if (currentIndex === filteredWords.length - 1) {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            }
        } else {
            handleNext();
        }
    }, [revealed, handleNext, currentIndex, filteredWords.length]);


    // Timer Restart
    useEffect(() => {
        if (showTimer) Timer.restart();
    }, [currentIndex, showTimer]);




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
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handlePrev, handleAction, handleGoFirst, handleGoLast]);

    if (filteredWords.length === 0) return <div style={{ color: 'white', padding: 20 }}>No items found.</div>;

    const enText = currentWord.sentence_en || currentWord.word_en;
    const taText = currentWord.sentence_ta || currentWord.word_ta;

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
                reset={() => {
                    setShuffle(false);
                    setDifficulty('all');
                    setSelectedCategories([...categories]);
                    setLevel(3);
                }}
                // Level Specific
                level={level}
                setLevel={setLevel}

                showTimer={showTimer}
                setShowTimer={setShowTimer}
                timerLabel={timerLabel}
                progressText={`${currentIndex + 1}/${filteredWords.length} slides - Filter: All Difficulty (Matches: D1=${filteredWords.filter(w => w.difficulty === 'D1').length}, D2=${filteredWords.filter(w => w.difficulty === 'D2').length})`}
            />

            <div className="slide-container">
                <div id="slides-wrapper" style={{ height: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div className="slide active" style={{ display: 'flex' }}>
                        <div className="slide-content">
                            <div className="slide-header">
                                <span className="category-badge">{currentWord.category}</span>
                                <span className="category-badge-ta">{currentWord.category_ta}</span>
                                <span className="difficulty-badge">{currentWord.difficulty}</span>
                            </div>
                            <div className="slide-body">
                                <div className="word-en" dangerouslySetInnerHTML={{ __html: enText }}></div>
                                {/* Tamil Reveal */}
                                <div className={`word-ta ${revealed ? 'revealed' : ''}`} dangerouslySetInnerHTML={{ __html: taText }}>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation - Standardized with Production UI */}
                <div className="navigation">
                    <button id="firstBtn" className="nav-btn" onClick={handleGoFirst} disabled={currentIndex === 0} title="First Slide (Home)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>
                    </button>
                    <button id="prevBtn" className="nav-btn" onClick={handlePrev} disabled={currentIndex === 0} title="Previous Slide (←)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>

                    <span className="slide-counter" id="counter">
                        {currentIndex + 1} / {filteredWords.length}
                    </span>

                    <button id="nextBtn"
                        className={`nav-btn ${!revealed ? 'reveal-mode' : ''}`}
                        onClick={handleAction}
                        disabled={currentIndex === filteredWords.length - 1 && revealed}
                        title={!revealed ? "Reveal (Space/Enter)" : "Next Slide (→)"}
                    >
                        {!revealed ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        )}
                    </button>

                    <button id="lastBtn" className="nav-btn" onClick={handleGoLast} disabled={currentIndex === filteredWords.length - 1} title="Last Slide (End)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
                    </button>
                </div>
            </div>
        </Fragment>
    );
}
