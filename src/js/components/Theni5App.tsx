import { Fragment } from 'preact';
import { useState, useEffect, useMemo, useCallback } from 'preact/hooks';
import confetti from 'canvas-confetti';
import { Controls } from './Controls';
import { useTheniModule } from '../hooks/useTheniModule';
import { Timer } from '../timer';
import theni5Words from '../../data/theni5_words.json';
import { Theni5Word } from '../../types/index';

export default function Theni5App() {
    const WORDS_PER_PAGE = 5;
    const allWords = useMemo(() => theni5Words as Theni5Word[], []);

    const [rangeStart, setRangeStart] = useState(1);
    const [rangeEnd, setRangeEnd] = useState(250);

    // Module Hook
    const {
        shuffle,
        setShuffle,
        currentIndex: currentPage,
        setCurrentIndex: setCurrentPage,
        showTimer,
        setShowTimer,
        handleNext: baseHandleNext,
        handlePrev,
        handleGoFirst,
        handleGoLast,
        resetSelection
    } = useTheniModule({
        allWords: [], // We'll manage processing locally for Theni5's range/pagination
        initialTimerDuration: 60
    });

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
        const start = (currentPage) * WORDS_PER_PAGE;
        return processedWords.slice(start, start + WORDS_PER_PAGE);
    }, [currentPage, processedWords]);

    // Reset page on scope changes - Note: useTheniModule uses 0-based for currentPage
    useEffect(() => setCurrentPage(0), [shuffle, rangeStart, rangeEnd]);

    const handleApplyRange = useCallback((s: number, e: number) => {
        setRangeStart(s);
        setRangeEnd(e);
    }, []);

    const handleNext = useCallback(() => {
        if (currentPage < totalPages - 1) {
            baseHandleNext();
            if (currentPage + 2 === totalPages && totalPages > 1) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#6a539d', '#9c88ff', '#ffffff']
                });
            }
        }
    }, [currentPage, totalPages, baseHandleNext]);

    const timerText = totalPages > 0 ? `Page ${currentPage + 1} of ${totalPages} (${filteredWords.length} words in range${shuffle ? ' - shuffled' : ''})` : 'No words in range';

    return (
        <Fragment>
            <Controls
                categories={[]}
                selectedCategories={[]}
                onToggleCategory={() => { }}
                onToggleAllCategories={() => { }}
                reset={() => {
                    resetSelection();
                    setRangeStart(1);
                    setRangeEnd(250);
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
                progressText={timerText}
            />

            {/* Progress Bar Container */}
            <div id="progressBarContainer" style={{ position: 'fixed', top: '0', left: '0', width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', zIndex: 1000 }}>
                <div id="progressBar" style={{ width: '0%', height: '100%', background: 'var(--primary-color, #667eea)', transition: 'width 0.3s ease' }}></div>
            </div>

            <div className="slide-container" onClick={(e) => { if (!(e.target as HTMLElement).closest('.navigation')) handleNext(); }} style={{ cursor: 'pointer' }}>
                <div className="words-list-centered">
                    {currentWords.length > 0 ? (
                        currentWords.map((wordItem: Theni5Word) => (
                            <div className="word-row-card" key={wordItem.s}>
                                <div className="word-text-ta">{wordItem.w}</div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state-container">
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                            No words found in this range.<br />
                            Try selecting a different word range in settings.
                        </div>
                    )}
                </div>

                <div className="navigation">
                    <button id="firstBtn" className="nav-btn" onClick={e => { e.stopPropagation(); handleGoFirst(); }} disabled={currentPage === 0} title="First Page">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="20" x2="7" y2="4"></line><polyline points="17 4 9 12 17 20"></polyline></svg>
                    </button>
                    <button id="prevBtn" className="nav-btn" onClick={e => { e.stopPropagation(); handlePrev(); }} disabled={currentPage === 0} title="Previous Page">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>

                    <span className="slide-counter" id="counter">{totalPages > 0 ? currentPage + 1 : 0} / {totalPages}</span>

                    <button id="nextBtn" className="nav-btn" onClick={e => { e.stopPropagation(); handleNext(); }} disabled={currentPage >= totalPages - 1 || totalPages === 0} title="Next Page">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                    <button id="lastBtn" className="nav-btn" onClick={e => { e.stopPropagation(); handleGoLast(); }} disabled={currentPage >= totalPages - 1 || totalPages === 0} title="Last Page">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="20" x2="17" y2="4"></line><polyline points="7 20 15 12 7 4"></polyline></svg>
                    </button>
                </div>
            </div>
        </Fragment>
    );
}
