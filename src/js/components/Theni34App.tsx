import { Fragment } from 'preact';
import { useState, useMemo, useCallback } from 'preact/hooks';
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
        resetSelection
    } = useTheniModule({
        allWords,
        initialTimerDuration: level === 4 ? (config.timerDurations.theni4 || 40) : (config.timerDurations.theni3 || 15)
    });

    const handleNext = useCallback(() => {
        if (currentIndex < filteredWords.length - 1) {
            baseHandleNext();
        } else {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
    }, [currentIndex, filteredWords.length, baseHandleNext]);

    const handleAction = useCallback(() => {
        if (!revealed) {
            setRevealed(true);
            if (currentIndex === filteredWords.length - 1) {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            }
        } else {
            handleNext();
        }
    }, [revealed, handleNext, currentIndex, filteredWords.length, setRevealed]);

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

            {filteredWords.length > 0 && currentWord ? (
                <div className="slide-container" onClick={(e) => { if (!(e.target as HTMLElement).closest('.navigation')) handleAction(); }} style={{ cursor: 'pointer' }}>
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
                                    <div className={`word-ta ${revealed ? 'revealed' : ''}`} dangerouslySetInnerHTML={{ __html: taText }}>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

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
