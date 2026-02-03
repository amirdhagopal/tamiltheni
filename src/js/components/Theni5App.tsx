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

    // 1. Filter first (Strict range adherence)
    const filteredWords = useMemo(() => {
        return allWords.filter(w => w.s >= rangeStart && w.s <= rangeEnd);
    }, [allWords, rangeStart, rangeEnd]);

    // Module Hook
    const {
        shuffle,
        setShuffle,
        currentIndex: currentPage,
        setCurrentIndex: setCurrentPage,
        showTimer,
        setShowTimer,
        resetSelection
    } = useTheniModule({
        allWords: filteredWords, // Pass filtered list to hook
        initialTimerDuration: 60,
        disableProgressUpdate: true,
        disableShortcuts: true
    });

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

    // Reset page on scope changes
    useEffect(() => {
        setCurrentPage(0);
    }, [shuffle, rangeStart, rangeEnd]);

    // - [x] Standardize SVG stroke-width for primary icons <!-- id: 23 -->
    // - [/] UI Refinements (Feedback V2) <!-- id: 24 -->
    //     - [ ] Remove Navigation Background Bar (Glass Island) <!-- id: 25 -->
    //     - [ ] Add bottom padding to slide content to prevent button overlap <!-- id: 26 -->
    useEffect(() => {
        const progress = totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0;
        const bar = document.getElementById('progressBar');
        if (bar) bar.style.width = `${progress}%`;
    }, [currentPage, totalPages]);

    const handleApplyRange = useCallback((s: number, e: number) => {
        setRangeStart(s);
        setRangeEnd(e);
    }, []);

    const handleGoFirst = useCallback(() => {
        setCurrentPage(0);
        document.dispatchEvent(new CustomEvent('requestPanelCollapse'));
    }, [setCurrentPage]);

    const handleGoLast = useCallback(() => {
        setCurrentPage(Math.max(0, totalPages - 1));
        document.dispatchEvent(new CustomEvent('requestPanelCollapse'));
    }, [setCurrentPage, totalPages]);

    const triggerConfetti = useCallback(() => {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 },
            colors: ['#6a539d', '#9c88ff', '#ffffff']
        };

        function fire(particleRatio: number, opts: any) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
    }, []);

    const handleNext = useCallback(() => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
            document.dispatchEvent(new CustomEvent('requestPanelCollapse'));
            if (currentPage + 2 === totalPages && totalPages > 1) {
                triggerConfetti();
            }
        } else if (totalPages > 0) {
            triggerConfetti();
        }
    }, [currentPage, totalPages, setCurrentPage, triggerConfetti]);

    const handlePrev = useCallback(() => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
            document.dispatchEvent(new CustomEvent('requestPanelCollapse'));
        }
    }, [currentPage, setCurrentPage]);

    // Global Click Trigger for Final Page
    useEffect(() => {
        const isLastPage = totalPages > 0 && currentPage === totalPages - 1;
        if (!isLastPage) return;

        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.navigation, .control-panel')) {
                triggerConfetti();
            }
        };

        window.addEventListener('click', handleGlobalClick);
        return () => window.removeEventListener('click', handleGlobalClick);
    }, [currentPage, totalPages, triggerConfetti]);

    const timerText = totalPages > 0 ? `Page ${currentPage + 1} of ${totalPages} (${filteredWords.length} words in range${shuffle ? ' - shuffled' : ''})` : 'No words in range';

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

            switch (e.key) {
                case 'ArrowLeft':
                    handlePrev();
                    break;
                case 'ArrowRight': case ' ': case 'Enter':
                    if (e.key === ' ') e.preventDefault();
                    handleNext();
                    break;
                case 'Home': case '[':
                    handleGoFirst();
                    break;
                case 'End': case ']':
                    handleGoLast();
                    break;
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handlePrev, handleNext, handleGoFirst, handleGoLast]);

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

            <div className="slide-container" onClick={(e) => {
                const target = e.target as HTMLElement;
                if (!target.closest('.navigation, .control-panel')) {
                    document.dispatchEvent(new CustomEvent('requestPanelCollapse'));

                    if (currentPage === totalPages - 1 && totalPages > 0) {
                        triggerConfetti();
                    } else if (!target.closest('.word-row-card')) {
                        handleNext();
                    }
                }
            }} style={{ cursor: 'pointer' }}>
                <div className="words-list-centered">
                    {currentWords.length > 0 ? (
                        currentWords.map((wordItem: Theni5Word) => (
                            <div className="word-row-card word-item" key={wordItem.s}>
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
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="20" x2="7" y2="4"></line><polyline points="17 4 9 12 17 20"></polyline></svg>
                    </button>
                    <button id="prevBtn" className="nav-btn" onClick={e => { e.stopPropagation(); handlePrev(); }} disabled={currentPage === 0} title="Previous Page">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>

                    <span className="slide-counter" id="counter">{totalPages > 0 ? currentPage + 1 : 0} / {totalPages}</span>

                    <button id="nextBtn" className="nav-btn" onClick={e => { e.stopPropagation(); handleNext(); }} disabled={currentPage >= totalPages - 1 || totalPages === 0} title="Next Page">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                    <button id="lastBtn" className="nav-btn" onClick={e => { e.stopPropagation(); handleGoLast(); }} disabled={currentPage >= totalPages - 1 || totalPages === 0} title="Last Page">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="20" x2="17" y2="4"></line><polyline points="7 20 15 12 7 4"></polyline></svg>
                    </button>
                </div>
            </div>
        </Fragment>
    );
}
