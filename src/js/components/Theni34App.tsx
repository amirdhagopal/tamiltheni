import { Fragment } from 'preact';
import { useState, useMemo, useCallback, useEffect } from 'preact/hooks';
import { Controls } from './Controls';
import { useTheniModule } from '../hooks/useTheniModule';
import { config } from '../config';
import theniWords from '../../data/theni_words.json';
import { Word } from '../../types/index';
import confetti from 'canvas-confetti';

export default function Theni34App() {
    const allWords = useMemo(() => theniWords as Word[], []);
    const [level, setLevel] = useState(3);

    // Module Hook
    const {
        categories,
        selectedCategories,
        difficulty,
        setDifficulty,
        shuffle,
        setShuffle,
        currentIndex,
        revealed,
        setRevealed,
        showTimer,
        setShowTimer,
        filteredWords,
        currentWord,
        handleNext: baseHandleNext,
        handlePrev,
        handleGoFirst,
        handleGoLast,
        toggleCategory,
        toggleAllCategories,
        resetSelection,
        isLast
    } = useTheniModule({
        allWords,
        initialTimerDuration: level === 4 ? (config.timerDurations.theni4 || 40) : (config.timerDurations.theni3 || 15)
    });

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
        if (!isLast) {
            baseHandleNext();
        } else {
            triggerConfetti();
        }
    }, [isLast, baseHandleNext, triggerConfetti]);

    const handleAction = useCallback(() => {
        const panel = document.getElementById('controlPanel');
        if (panel && panel.classList.contains('open')) {
            document.dispatchEvent(new CustomEvent('requestPanelCollapse'));
            return;
        }

        if (!revealed) {
            setRevealed(true);
            if (isLast) {
                triggerConfetti();
            }
        } else {
            handleNext();
        }
    }, [revealed, handleNext, isLast, setRevealed, triggerConfetti]);

    // Global Click Trigger for Final Slide
    useEffect(() => {
        if (!isLast || !revealed) return;

        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.navigation, .control-panel')) {
                triggerConfetti();
            }
        };

        window.addEventListener('click', handleGlobalClick);
        return () => window.removeEventListener('click', handleGlobalClick);
    }, [isLast, revealed, triggerConfetti]);
    // Progress Bar Logic
    useEffect(() => {
        const progress = filteredWords.length > 0 ? ((currentIndex + 1) / filteredWords.length) * 100 : 0;
        const bar = document.getElementById('progressBar');
        if (bar) bar.style.width = `${progress}%`;
    }, [currentIndex, filteredWords.length]);

    const timerLabel = `Timer (${level === 3 ? '15s' : '40s'})`;
    const enText = currentWord ? (currentWord.sentence_en || currentWord.word_en) : '';
    const taText = currentWord ? (currentWord.sentence_ta || currentWord.word_ta) : '';

    return (
        <Fragment>
            <Controls
                categories={categories}
                selectedCategories={selectedCategories}
                onToggleCategory={toggleCategory}
                onToggleAllCategories={toggleAllCategories}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                shuffle={shuffle}
                setShuffle={setShuffle}
                reset={resetSelection}
                level={level}
                setLevel={setLevel}
                showTimer={showTimer}
                setShowTimer={setShowTimer}
                timerLabel={timerLabel}
                progressText={`${currentIndex + 1}/${filteredWords.length} slides - Filter: All Difficulty (Matches: D1=${filteredWords.filter(w => w.difficulty === 'D1').length}, D2=${filteredWords.filter(w => w.difficulty === 'D2').length})`}
            />

            {/* Progress Bar Container */}
            <div className="progress-bar-container">
                <div id="progressBar" className="progress-bar" style={{ width: '0%' }}></div>
            </div>

            {filteredWords.length > 0 && currentWord ? (
                <div className="slide-container" onClick={(e) => { if (!(e.target as HTMLElement).closest('.navigation, .control-panel')) handleAction(); }} style={{ cursor: 'pointer' }}>
                    <div id="slides-wrapper" style={{ height: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div id={`slide-${currentIndex}`} className={`slide active ${revealed ? 'revealed' : ''}`} key={currentWord.word_en} style={{ display: 'flex' }}>
                            <div className="slide-header">
                                <div className="header-badges">
                                    <span className="category-badge">{currentWord.category}</span>
                                    <span className="category-badge-ta">{currentWord.category_ta}</span>
                                    <span className="difficulty-badge">{currentWord.difficulty}</span>
                                </div>
                            </div>

                            <div className="slide-content">
                                <div className="focus-card">
                                    <div className="word-en" dangerouslySetInnerHTML={{ __html: enText }}></div>
                                    <div className={`word-ta ${revealed ? 'revealed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: taText }}
                                        style={{ visibility: revealed ? 'visible' : 'hidden' }}>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="navigation">
                        <button id="firstBtn" className="nav-btn" onClick={e => { e.stopPropagation(); handleGoFirst(); }} disabled={currentIndex === 0} title="First Slide (Home)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="20" x2="7" y2="4"></line><polyline points="17 4 9 12 17 20"></polyline></svg>
                        </button>
                        <button id="prevBtn" className="nav-btn" onClick={e => { e.stopPropagation(); handlePrev(); }} disabled={currentIndex === 0} title="Previous Slide (←)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
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
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            )}
                        </button>

                        <button id="lastBtn" className="nav-btn" onClick={e => { e.stopPropagation(); handleGoLast(); }} disabled={currentIndex === filteredWords.length - 1} title="Last Slide (End)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="20" x2="17" y2="4"></line><polyline points="7 20 15 12 7 4"></polyline></svg>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="empty-state-container">
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                    No items found for the current selection.<br />
                    Please check your Category or Difficulty filters.
                </div>
            )}
        </Fragment>
    );
}
