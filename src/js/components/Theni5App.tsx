import { Fragment } from 'preact';
import { useState, useEffect, useMemo, useCallback } from 'preact/hooks';
import confetti from 'canvas-confetti';
import { Controls } from './Controls';
import { Timer } from '../timer';
import theni5Words from '../../data/theni5_words.json';
import { Theni5Word } from '../../types/index';

export default function Theni5App() {
    const WORDS_PER_PAGE = 5;
    const allWords = useMemo(() => theni5Words as Theni5Word[], []);

    const [rangeStart, setRangeStart] = useState(1);
    const [rangeEnd, setRangeEnd] = useState(250);
    const [currentPage, setCurrentPage] = useState(1);
    const [showTimer, setShowTimer] = useState(true);
    const [shuffle, setShuffle] = useState(false);

    // 1. Filter first (Strict range adherence)
    const filteredWords = useMemo(() => {
        return allWords.filter(w => w.s >= rangeStart && w.s <= rangeEnd);
    }, [allWords, rangeStart, rangeEnd]);

    // 2. Shuffle second
    const processedWords = useMemo(() => {
        let words = [...filteredWords];
        if (shuffle) {
            for (let i = words.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [words[i], words[j]] = [words[j], words[i]];
            }
        }
        return words;
    }, [filteredWords, shuffle]);

    const totalPages = Math.ceil(processedWords.length / WORDS_PER_PAGE);

    // 3. Paginate
    const currentWords = useMemo(() => {
        const start = (currentPage - 1) * WORDS_PER_PAGE;
        return processedWords.slice(start, start + WORDS_PER_PAGE);
    }, [currentPage, processedWords]);

    // Reset page on scope changes
    useEffect(() => setCurrentPage(1), [shuffle, rangeStart, rangeEnd]);

    const handleApplyRange = useCallback((s: number, e: number) => {
        setRangeStart(s);
        setRangeEnd(e);
    }, []);

    const handleNext = useCallback(() => {
        if (currentPage < totalPages) {
            setCurrentPage(p => p + 1);
            if (currentPage + 1 === totalPages && totalPages > 1) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#6a539d', '#9c88ff', '#ffffff']
                });
            }
        }
    }, [currentPage, totalPages]);

    const handlePrev = useCallback(() => {
        if (currentPage > 1) setCurrentPage(p => p - 1);
    }, [currentPage]);

    const handleFirst = useCallback(() => setCurrentPage(1), []);
    const handleLast = useCallback(() => setCurrentPage(totalPages), [totalPages]);

    // Timer Init
    useEffect(() => {
        // Delay slightly to ensure layout elements are injected
        setTimeout(() => Timer.init(60), 100);
    }, []);

    // Timer Visibility
    useEffect(() => {
        const pill = document.getElementById('timerPill');
        if (pill) pill.style.display = showTimer ? '' : 'none';
    }, [showTimer]);

    // Timer Auto-restart
    useEffect(() => {
        if (showTimer) Timer.restart();
    }, [currentPage, showTimer, shuffle, rangeStart, rangeEnd]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement) return;
            switch (e.key) {
                case 'ArrowLeft': handlePrev(); break;
                case 'ArrowRight': handleNext(); break;
                case ' ': e.preventDefault(); handleNext(); break;
                case 'Enter': handleNext(); break;
                case 'Home': case '[': handleFirst(); break;
                case 'End': case ']': handleLast(); break;
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handleNext, handlePrev, handleFirst, handleLast]);

    return (
        <Fragment>
            <Controls
                categories={[]}
                selectedCategories={[]}
                onToggleCategory={() => { }}
                onToggleAllCategories={() => { }}
                reset={() => {
                    setShuffle(false);
                    setCurrentPage(1);
                    Timer.restart();
                }}
                shuffle={shuffle}
                setShuffle={setShuffle}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                onApplyRange={handleApplyRange}
                showTimer={showTimer}
                setShowTimer={setShowTimer}
                timerLabel="Timer (1m)"
                progressText={`Page ${currentPage} of ${totalPages} (${filteredWords.length} words in range${shuffle ? ' - shuffled' : ''})`}
            />

            <div className="slide-container">
                <div className="words-list-centered">
                    {currentWords.length > 0 ? (
                        currentWords.map((wordItem: Theni5Word) => (
                            <div className="word-row-card" key={wordItem.s}>
                                <div className="word-text-ta">{wordItem.w}</div>
                            </div>
                        ))
                    ) : (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '40vh',
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '1.2rem',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                            No words found in this range.<br />
                            Try selecting a different word range in settings.
                        </div>
                    )}
                </div>

                <div className="navigation">
                    <button className="nav-btn" onClick={handleFirst} disabled={currentPage === 1} title="First Page">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>
                    </button>
                    <button className="nav-btn" onClick={handlePrev} disabled={currentPage === 1} title="Previous Page">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>

                    <span className="slide-counter">{currentPage} / {totalPages}</span>

                    <button className="nav-btn play-btn" onClick={handleNext} disabled={currentPage === totalPages || totalPages === 0} title="Next Page">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </button>
                    <button className="nav-btn" onClick={handleLast} disabled={currentPage === totalPages || totalPages === 0} title="Last Page">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
                    </button>
                </div>
            </div>
        </Fragment>
    );
}
