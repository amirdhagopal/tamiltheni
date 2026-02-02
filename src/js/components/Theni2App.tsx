import { Fragment } from 'preact';
import { useState, useEffect, useMemo, useCallback } from 'preact/hooks';
import { Word } from '../../types/index';
import theniWords from '../../data/theni_words.json';
import { Utils } from '../utils';
import { AudioManager } from '../audio_manager';
import { SentenceConstructorAgent } from '../agents/sentence_agent';
import { useTheniModule } from '../hooks/useTheniModule';
import { Controls } from './Controls';
import confetti from 'canvas-confetti';

const sentenceAgent = new SentenceConstructorAgent();

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

export default function Theni2App() {
    const allWords = useMemo(() => theniWords as Word[], []);
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('GEMINI_API_KEY') || '');

    // AI State
    const [aiStatus, setAiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [aiResult, setAiResult] = useState<{ tamil: string, en: string } | null>(null);
    const [lastAiError, setLastAiError] = useState('');

    const clearAi = useCallback(() => {
        setAiStatus('idle');
        setAiResult(null);
        setLastAiError('');
    }, []);

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
        audioEnabled,
        setAudioEnabled,
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
        initialTimerDuration: 20,
        onFilterChange: clearAi,
        onIndexChange: clearAi
    });

    const partnerMap = useMemo(() => {
        const map = new Map<number, number>();
        const len = filteredWords.length;
        const allIndices = Array.from({ length: len }, (_, i) => i);
        for (let i = 0; i < len; i++) {
            if (len <= 1) {
                map.set(i, i);
                continue;
            }
            const possiblePartners = allIndices.filter(idx => idx !== i);
            const randomPartner = possiblePartners[Math.floor(Math.random() * possiblePartners.length)];
            map.set(i, randomPartner);
        }
        return map;
    }, [filteredWords]);

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
            baseHandleNext();
        } else {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }
    }, [currentIndex, filteredWords.length, baseHandleNext]);

    const handleAction = useCallback(() => {
        if (!revealed) setRevealed(true);
        else handleNext();
    }, [revealed, setRevealed, handleNext]);

    // Dual-word Audio Playback
    useEffect(() => {
        if (audioEnabled && currentWord && partnerWord) {
            let t2: ReturnType<typeof setTimeout>;
            const t1 = setTimeout(() => {
                if (audioEnabled) {
                    AudioManager.speak(currentWord.word_en, 'en-US');
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
                onToggleCategory={toggleCategory}
                onToggleAllCategories={toggleAllCategories}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                shuffle={shuffle}
                setShuffle={setShuffle}
                reset={resetSelection}
                audioEnabled={audioEnabled}
                setAudioEnabled={setAudioEnabled}
                showTimer={showTimer}
                setShowTimer={setShowTimer}
                timerLabel="Timer (20s)"
                progressText={`${currentIndex + 1}/${filteredWords.length} slides - Filter: ${difficulty} ${shuffle ? '(Shuffled)' : ''}`}
                apiKey={apiKey}
                setApiKey={setApiKey}
            />

            {/* Progress Bar Container */}
            <div id="progressBarContainer" style={{ position: 'fixed', top: '0', left: '0', width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', zIndex: 1000 }}>
                <div id="progressBar" style={{ width: '0%', height: '100%', background: 'var(--primary-color, #667eea)', transition: 'width 0.3s ease' }}></div>
            </div>

            <div className="slide-container">
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

                <div className="dual-view-container" id="slides-wrapper" onClick={handleAction} style={{ cursor: 'pointer' }}>
                    <Card word={currentWord} side={1} show={revealed} />
                    <Card word={partnerWord} side={2} show={revealed} />
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
        </Fragment>
    );
}
