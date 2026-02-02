import { Fragment } from 'preact';
import { useState, useEffect, useMemo } from 'preact/hooks';
import { Word } from '../../types/index';
import theniWords from '../../data/theni_words.json';
import { Utils } from '../utils';
import { SentenceConstructorAgent } from '../agents/sentence_agent';
import { Controls } from './Controls';
import confetti from 'canvas-confetti';

const sentenceAgent = new SentenceConstructorAgent();

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

// --- Sub-components ---

// ... (Sub-components) ...

// Remove old local Controls implementation

// --- Main App ---

export default function Theni2App() {
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
    const [currentIndex, setCurrentIndex] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('GEMINI_API_KEY') || '');

    // AI State
    const [aiStatus, setAiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [aiResult, setAiResult] = useState<{ tamil: string, en: string } | null>(null);
    const [lastAiError, setLastAiError] = useState('');

    // Settings
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [showTimer, setShowTimer] = useState(true);

    // Derived State
    const [filteredWords, setFilteredWords] = useState<Word[]>([]);

    // Partner Logic
    const partnerMap = useMemo(() => {
        const map = new Map<number, number>();
        const shuffled = [...Array(allWords.length).keys()];
        Utils.shuffleArray(shuffled);
        for (let i = 0; i < shuffled.length; i++) {
            map.set(i, shuffled[(i + 1) % shuffled.length]);
        }
        return map;
    }, [allWords]);

    useEffect(() => {
        let result = allWords.filter((w: Word) => {
            const catKey = `${w.category} - ${w.category_ta}`;
            return selectedCategories.includes(catKey) && (difficulty === 'all' || w.difficulty === difficulty);
        });
        if (shuffle) Utils.shuffleArray(result);
        setFilteredWords(result);
        setCurrentIndex(0);
        setRevealed(false);
    }, [selectedCategories, difficulty, shuffle, allWords]);

    const currentWord = filteredWords[currentIndex];
    const partnerIndex = currentWord ? partnerMap.get(allWords.findIndex(w => w.id === currentWord.id)) ?? 0 : 0;
    const partnerWord = allWords[partnerIndex];

    const generateSentence = async () => {
        if (!currentWord || !partnerWord) return;
        setAiStatus('loading');
        try {
            const result = await sentenceAgent.generateSentence(currentWord.word_ta, partnerWord.word_ta, apiKey);
            setAiResult(result);
            setAiStatus('success');
        } catch (e: any) {
            setLastAiError(e.message);
            setAiStatus('error');
        }
    };

    const handleAction = () => {
        if (!revealed) setRevealed(true);
        else {
            if (currentIndex < filteredWords.length - 1) {
                setCurrentIndex((v: number) => v + 1);
                setRevealed(false);
                setAiStatus('idle');
                setAiResult(null);
            } else {
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            }
        }
    };

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
            <div className="dual-view-container" onClick={handleAction} style={{ cursor: 'pointer' }}>
                <Card word={currentWord} side={1} show={revealed} />
                <Card word={partnerWord} side={2} show={revealed} />
            </div>

        </Fragment>
    );
}
