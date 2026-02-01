import { Fragment } from 'preact';
import { useState, useEffect, useMemo, useCallback } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import { Word } from '../../types';
import theniWords from '../../data/theni_words.json';
import { Utils } from '../utils';
import { AudioManager } from '../audio_manager';
import { Timer } from '../timer';
import { SentenceConstructorAgent } from '../agents/sentence_agent';
import confetti from 'canvas-confetti';

// --- Sub-components ---

const Card = ({ word, side, show }: { word: Word | null, side: 1 | 2, show: boolean }) => {
    const [imgSrc, setImgSrc] = useState<string>('https://placehold.co/300x180?text=Loading...');

    useEffect(() => {
        if (!word) {
            setImgSrc('');
            return;
        }

        // Image logic
        const keyword = word.image_word || word.word_en.toLowerCase();
        const path = Utils.getImagePath(keyword);

        // Simple validity check or let browser handle error
        const img = new Image();
        img.onload = () => setImgSrc(path);
        img.onerror = () => setImgSrc(`https://placehold.co/300x180?text=${encodeURIComponent(word.word_en)}`);
        img.src = path;

    }, [word]);

    if (!word) return <div class="dual-word-card" />;

    return (
        <div className={`dual-word-card ${show ? 'revealed' : ''}`} id={`card${side}`}>
            <div className="card-image">
                <img id={`card${side}Img`} src={imgSrc} alt={word.word_en} />
            </div>
            <div className="word-en" id={`card${side}En`}>{word.word_en}</div>
            <div className="word-ta" id={`card${side}Ta`}>{word.word_ta}</div>
            <div className="card-footer-badges">
                <span className="card-badge category-label">{word.category}</span>
                <span className="card-badge category-label-ta">{word.category_ta}</span>
                <span className="card-badge difficulty-label">{word.difficulty}</span>
            </div>
        </div>
    );
};

import { Controls } from './Controls';

// ... (Sub-components) ...

// Remove old local Controls implementation

// --- Main App ---

export default function Theni2App() {
    // ... (State logic same as before) ...

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
                reset={() => { setShuffle(false); setDifficulty('all'); setSelectedCategories([...categories]); }}
                audioEnabled={audioEnabled}
                setAudioEnabled={setAudioEnabled}
                showTimer={showTimer}
                setShowTimer={setShowTimer}
                timerLabel="Timer (20s)"
                progressText={`${currentIndex + 1}/${filteredWords.length} slides - Filter: ${difficulty} ${shuffle ? '(Shuffled)' : ''}`}
                apiKey={apiKey}
                setApiKey={setApiKey}
            />

            {/* AI Section ... */}

            {/* AI Section */}
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

            {/* Cards */}
            <div className="dual-view-container">
                <Card word={currentWord} side={1} show={revealed} />
                <Card word={partnerWord} side={2} show={revealed} />
            </div>

        </Fragment>
    );
}
