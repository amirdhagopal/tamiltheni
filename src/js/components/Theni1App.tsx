import { Fragment } from 'preact';
import { useState, useEffect, useMemo, useCallback } from 'preact/hooks';
import { Controls } from './Controls';
import { Utils } from '../utils';
import { AudioManager } from '../audio_manager';
import { Timer } from '../timer';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import theniWords from '../../data/theni_words.json';
import { Word } from '../../types';
import confetti from 'canvas-confetti';

export default function Theni1App() {
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

    // Derived State
    const [filteredWords, setFilteredWords] = useState<Word[]>(() => [...allWords]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [revealed, setRevealed] = useState(false);

    // Settings
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [showTimer, setShowTimer] = useState(true);

    // Hooks
    const { isRecording, feedback, setFeedback, toggleRecording, stopRecording } = useSpeechRecognition();

    // Timer Init
    useEffect(() => {
        setTimeout(() => Timer.init(8), 100);
    }, []);

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
        setRevealed(false);
        stopRecording(); // Stop ANY recording on filter change
    }, [selectedCategories, difficulty, shuffle, allWords]);

    const currentWord = filteredWords[currentIndex] || null;

    // Progress
    useEffect(() => {
        Utils.updateProgress(currentIndex, filteredWords.length, 'progressBar', 'counter');
    }, [currentIndex, filteredWords]);


    // Validation Logic
    const handleVoiceResult = (spokenText: string) => {
        if (!currentWord) return;

        const targetText = currentWord.word_ta;
        const normalize = (text: string) => text.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').replace(/\s+/g, '');

        const normalizedSpoken = normalize(spokenText);
        const normalizedTarget = normalize(targetText);

        if (normalizedSpoken === normalizedTarget || normalizedTarget.includes(normalizedSpoken) || normalizedSpoken.includes(normalizedTarget)) {
            setFeedback({ text: `Correct! ✅ (${spokenText})`, type: 'success' });

            // Reveal Logic
            if (!revealed) {
                setRevealed(true);
                // Last Slide Confetti
                if (currentIndex === filteredWords.length - 1) {
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                }
            }
        } else {
            setFeedback({ text: `Heard "${spokenText}" ❌`, type: 'error' });
        }
    };

    // Actions
    const handleNext = useCallback(() => {
        if (currentIndex < filteredWords.length - 1) {
            setCurrentIndex(c => c + 1);
            setRevealed(false);
            setFeedback({ text: '', type: '' });
            stopRecording();
        }
    }, [currentIndex, filteredWords]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(c => c - 1);
            setRevealed(false);
            setFeedback({ text: '', type: '' });
            stopRecording();
        }
    }, [currentIndex]);

    const handleGoFirst = useCallback(() => {
        setCurrentIndex(0);
        setRevealed(false);
        setFeedback({ text: '', type: '' });
        stopRecording();
    }, []);

    const handleGoLast = useCallback(() => {
        setCurrentIndex(filteredWords.length - 1);
        setRevealed(false);
        setFeedback({ text: '', type: '' });
        stopRecording();
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


    // Audio Playback
    useEffect(() => {
        if (audioEnabled && currentWord) {
            // Debounce slightly to allow transition
            const t = setTimeout(() => {
                if (audioEnabled && currentWord) AudioManager.speak(currentWord.word_en, 'en-US');
            }, 300);
            return () => clearTimeout(t);
        }
    }, [currentIndex, audioEnabled, currentWord]);

    // Timer Restart on Slide Change
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


    // Render
    // Removed early return to keep Controls visible at all times

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
                reset={() => { setShuffle(false); setCurrentIndex(0); setRevealed(false); }}
                audioEnabled={audioEnabled}
                setAudioEnabled={setAudioEnabled}
                voiceEnabled={voiceEnabled}
                setVoiceEnabled={setVoiceEnabled}
                showTimer={showTimer}
                setShowTimer={setShowTimer}
                timerLabel="Timer (8s)"
                progressText={`${currentIndex + 1}/${filteredWords.length} slides - Filter: ${difficulty} ${shuffle ? '(Shuffled)' : ''}`}
            />

            {filteredWords.length > 0 && currentWord ? (
                <div className="slide-container" onClick={handleAction} style={{ cursor: 'pointer' }}>
                    {/* Slide Content */}
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
                                            onClick={(e) => { e.stopPropagation(); toggleRecording(handleVoiceResult); }}
                                            title={isRecording ? "Stop Listening" : "Start Voice Validation"}
                                            style={{ display: 'inline-flex', marginLeft: '10px' }}
                                        >
                                            {isRecording ? '⏹️' : '🎤'}
                                        </button>
                                        <span className={`voice-feedback-inline ${feedback.type}`}>{feedback.text}</span>
                                    </Fragment>
                                )}
                            </div>

                            {/* Tamil Word - Revealed Class Logic */}
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

                    {/* Navigation */}
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
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '50vh',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '1.2rem',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                    No words found for the current selection.<br />
                    Please check your Category or Difficulty filters.
                </div>
            )}
        </Fragment>
    );
}
