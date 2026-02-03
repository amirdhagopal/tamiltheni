import { Fragment } from 'preact';
import { useEffect, useMemo, useCallback } from 'preact/hooks';
import { Controls } from './Controls';
import { Utils } from '../utils';
import { AudioManager } from '../audio_manager';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTheniModule } from '../hooks/useTheniModule';
import theniWords from '../../data/theni_words.json';
import { Word } from '../../types';
import confetti from 'canvas-confetti';

export default function Theni1App() {
    const allWords = useMemo(() => theniWords as Word[], []);

    // Speech Recognition
    const { isRecording, feedback, setFeedback, toggleRecording, stopRecording } = useSpeechRecognition();

    // Theni Module Hook
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
        audioEnabled,
        setAudioEnabled,
        voiceEnabled,
        setVoiceEnabled,
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
        initialTimerDuration: 8,
        onFilterChange: stopRecording,
        onIndexChange: stopRecording
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

    // Custom Handle Action to include Confetti and Next Logic
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
            setFeedback({ text: '', type: '' });
        }
    }, [revealed, handleNext, isLast, setRevealed, setFeedback, triggerConfetti]);

    // Global Click Trigger for Final Slide
    useEffect(() => {
        if (!isLast || !revealed) return;

        const handleGlobalClick = (e: MouseEvent) => {
            // Only trigger if not clicking on navigation or controls
            const target = e.target as HTMLElement;
            if (!target.closest('.navigation, .mic-button-inline, .control-panel')) {
                triggerConfetti();
            }
        };

        window.addEventListener('click', handleGlobalClick);
        return () => window.removeEventListener('click', handleGlobalClick);
    }, [isLast, revealed, triggerConfetti]);

    // Validation Logic
    const handleVoiceResult = (spokenText: string) => {
        if (!currentWord) return;

        const targetText = currentWord.word_ta;
        const normalize = (text: string) => text.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').replace(/\s+/g, '');

        const normalizedSpoken = normalize(spokenText);
        const normalizedTarget = normalize(targetText);

        if (normalizedSpoken === normalizedTarget || normalizedTarget.includes(normalizedSpoken) || normalizedSpoken.includes(normalizedTarget)) {
            setFeedback({ text: `Correct! ✅ (${spokenText})`, type: 'success' });
            if (!revealed) {
                setRevealed(true);
                if (isLast) {
                    triggerConfetti();
                }
            }
        } else {
            setFeedback({ text: `Heard "${spokenText}" ❌`, type: 'error' });
        }
    };

    // Audio Playback
    useEffect(() => {
        if (audioEnabled && currentWord) {
            const speakWord = () => {
                if (audioEnabled && currentWord) AudioManager.speak(currentWord.word_en, 'en-US');
            };

            const t = setTimeout(speakWord, 300);

            // Special handling for first slide: Ensure audio plays if allowed
            if (currentIndex === 0) {
                const autoSpeak = () => {
                    speakWord();
                    document.removeEventListener('click', autoSpeak);
                };
                document.addEventListener('click', autoSpeak);
                return () => {
                    clearTimeout(t);
                    document.removeEventListener('click', autoSpeak);
                };
            }

            return () => clearTimeout(t);
        }
    }, [currentIndex, audioEnabled, currentWord]);

    // Progress Bar Logic
    useEffect(() => {
        const progress = filteredWords.length > 0 ? ((currentIndex + 1) / filteredWords.length) * 100 : 0;
        const bar = document.getElementById('progressBar');
        if (bar) bar.style.width = `${progress}%`;
    }, [currentIndex, filteredWords.length]);

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
                audioEnabled={audioEnabled}
                setAudioEnabled={setAudioEnabled}
                voiceEnabled={voiceEnabled}
                setVoiceEnabled={setVoiceEnabled}
                showTimer={showTimer}
                setShowTimer={setShowTimer}
                timerLabel="Timer (8s)"
                progressText={`${currentIndex + 1}/${filteredWords.length} slides - Filter: ${difficulty} ${shuffle ? '(Shuffled)' : ''}`}
            />

            {/* Progress Bar Container */}
            <div className="progress-bar-container">
                <div id="progressBar" className="progress-bar" style={{ width: '0%' }}></div>
            </div>

            {filteredWords.length > 0 && currentWord ? (
                <div className="slide-container" onClick={(e) => {
                    // Only trigger if click is on the slide itself, not interactive elements
                    if (!(e.target as HTMLElement).closest('.navigation, .mic-button-inline, .control-panel')) {
                        handleAction();
                    }
                }} style={{ cursor: 'pointer' }}>
                    <div id="slides-wrapper" style={{ height: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div id={`slide-${currentIndex}`} className={`slide active ${revealed ? 'revealed' : ''}`}>
                            {/* Card Header - Category and Difficulty Badges */}
                            <div className="card-footer">
                                <div className="footer-left">
                                    <span className="category-badge">{currentWord.category}</span>
                                    <span className="category-badge-ta">{currentWord.category_ta}</span>
                                    <span className="difficulty-badge">{currentWord.difficulty}</span>
                                </div>
                            </div>

                            <div className="slide-content">
                                <div className="image-container">
                                    <img
                                        src={Utils.getImagePath(currentWord?.image_word || '')}
                                        alt={currentWord?.word_en || ''}
                                        className="slide-image"
                                        onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x300?text=${encodeURIComponent(currentWord?.image_word || 'Image Missing')}`; }}
                                    />
                                </div>
                                <div className="word-row">
                                    <div className="word-en" dangerouslySetInnerHTML={{ __html: currentWord.word_en }}></div>
                                    {voiceEnabled && (
                                        <Fragment>
                                            <button
                                                className={`mic-button-inline ${isRecording ? 'recording' : ''}`}
                                                onClick={() => toggleRecording(handleVoiceResult)}
                                                title={isRecording ? "Stop Listening" : "Start Voice Validation"}
                                                style={{ display: 'inline-flex', marginLeft: '10px' }}
                                            >
                                                {isRecording ? '⏹️' : '🎤'}
                                            </button>
                                            <span className={`voice-feedback-inline ${feedback.type}`}>{feedback.text}</span>
                                        </Fragment>
                                    )}
                                </div>

                                <div
                                    id="wordTa"
                                    className={`word-ta ${revealed ? 'revealed' : ''}`.trim()}
                                >
                                    {currentWord.word_ta}
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
                    No words found for the current selection.<br />
                    Please check your Category or Difficulty filters.
                </div>
            )}
        </Fragment>
    );
}
