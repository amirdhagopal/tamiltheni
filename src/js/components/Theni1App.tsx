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
        handleNext,
        handlePrev,
        handleGoFirst,
        handleGoLast,
        toggleCategory,
        toggleAllCategories,
        resetSelection
    } = useTheniModule({
        allWords,
        initialTimerDuration: 8,
        onFilterChange: stopRecording,
        onIndexChange: stopRecording
    });

    // Custom Handle Action to include Confetti and Next Logic
    // Custom Handle Action to include Confetti and Next Logic
    const handleAction = useCallback(() => {
        if (!revealed) {
            setRevealed(true);
            if (currentIndex === filteredWords.length - 1) {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            }
        } else {
            handleNext();
            setFeedback({ text: '', type: '' });
        }
    }, [revealed, handleNext, currentIndex, filteredWords.length, setRevealed, setFeedback]);

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
                if (currentIndex === filteredWords.length - 1) {
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                }
            }
        } else {
            setFeedback({ text: `Heard "${spokenText}" ❌`, type: 'error' });
        }
    };

    // Audio Playback
    useEffect(() => {
        if (audioEnabled && currentWord) {
            const t = setTimeout(() => {
                if (audioEnabled && currentWord) AudioManager.speak(currentWord.word_en, 'en-US');
            }, 300);
            return () => clearTimeout(t);
        }
    }, [currentIndex, audioEnabled, currentWord]);

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
            <div id="progressBarContainer" style={{ position: 'fixed', top: '0', left: '0', width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', zIndex: 1000 }}>
                <div id="progressBar" style={{ width: '0%', height: '100%', background: 'var(--primary-color, #667eea)', transition: 'width 0.3s ease' }}></div>
            </div>

            {filteredWords.length > 0 && currentWord ? (
                <div className="slide-container" onClick={(e) => {
                    // Only trigger if click is on the slide itself, not interactive elements
                    if (!(e.target as HTMLElement).closest('.navigation, .mic-button-inline, .controls-panel')) {
                        handleAction();
                    }
                }} style={{ cursor: 'pointer' }}>
                    <div id="slides-wrapper" style={{ height: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div className="slide active" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '60px' }}>
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

                            <div className={`word-ta ${revealed ? 'revealed' : ''}`}>
                                {currentWord.word_ta}
                            </div>

                            <div className="card-footer">
                                <div className="footer-left">
                                    <span className="category-badge">{currentWord.category}</span>
                                    <span className="category-badge-ta">{currentWord.category_ta}</span>
                                    <span className="difficulty-badge">{currentWord.difficulty}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="navigation" onClick={e => e.stopPropagation()}>
                        <button id="firstBtn" className="nav-btn" onClick={handleGoFirst} disabled={currentIndex === 0} title="First Slide (Home)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="20" x2="7" y2="4"></line><polyline points="17 4 9 12 17 20"></polyline></svg>
                        </button>
                        <button id="prevBtn" className="nav-btn" onClick={handlePrev} disabled={currentIndex === 0} title="Previous Slide (←)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
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
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            )}
                        </button>

                        <button id="lastBtn" className="nav-btn" onClick={handleGoLast} disabled={currentIndex === filteredWords.length - 1} title="Last Slide (End)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="20" x2="17" y2="4"></line><polyline points="7 20 15 12 7 4"></polyline></svg>
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
