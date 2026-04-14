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

    return (
        <div className={`dual-word-card ${show ? 'revealed' : ''}`} id={`card${side}`}>
            <div className="card-header-badges">
                <span className="card-badge category-label">{word.category}</span>
                <span className="card-badge category-label-ta">{word.category_ta}</span>
                <span className="card-badge difficulty-label">{word.difficulty}</span>
            </div>
            <div className="card-image">
                <img id={`card${side}Img`} src={imgSrc} alt={word.word_en} />
            </div>
            <div className="word-en" id={`card${side}En`}>{word.word_en}</div>
            <div className="word-ta" id={`card${side}Ta`}>
                {word.word_ta}
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

    // Persist API Key
    useEffect(() => {
        localStorage.setItem('GEMINI_API_KEY', apiKey);
    }, [apiKey]);

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
        toggleYear,
        toggleAllYears,
        toggleRound,
        toggleAllRounds,
        availableYears,
        availableRounds,
        selectedYears,
        selectedRounds,
        resetSelection,
        isLast
    } = useTheniModule({
        allWords,
        initialTimerDuration: 20,
        onFilterChange: clearAi,
        onIndexChange: clearAi
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
    }, [revealed, setRevealed, handleNext, isLast, triggerConfetti]);

    // Global Click Trigger for Final Slide
    useEffect(() => {
        if (!isLast || !revealed) return;

        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.navigation, .mic-button-inline, .control-panel, .ai-section')) {
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
                availableYears={availableYears}
                selectedYears={selectedYears}
                onToggleYear={toggleYear}
                onToggleAllYears={toggleAllYears}
                availableRounds={availableRounds}
                selectedRounds={selectedRounds}
                onToggleRound={toggleRound}
                onToggleAllRounds={toggleAllRounds}
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
            <div className="progress-bar-container">
                <div id="progressBar" className="progress-bar" style={{ width: '0%' }}></div>
            </div>

            <div className="slide-container">
                <div className="ai-section">
                    <button className="ai-btn" id="aiBtn" onClick={generateSentence} disabled={aiStatus === 'loading'}>
                        <span>{aiStatus === 'loading' ? '⏳' : '✨'}</span> {aiStatus === 'loading' ? 'Generating...' : 'Generate Sentence with AI'}
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

                <div className="dual-view-container" id="slides-wrapper" onClick={(e) => {
                    if (!(e.target as HTMLElement).closest('.navigation, .control-panel')) {
                        handleAction();
                    }
                }} style={{ cursor: 'pointer' }}>
                    <Card word={currentWord} side={1} show={revealed} />
                    <Card word={partnerWord} side={2} show={revealed} />
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
        </Fragment>
    );
}
