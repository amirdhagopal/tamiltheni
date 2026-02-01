import { h, Fragment } from 'preact';
import { useState, useEffect, useMemo, useCallback } from 'preact/hooks';
import { Controls } from './Controls';
import { Utils } from '../utils';
import { Timer } from '../timer';
import { Layout } from '../layout';
import theni5Words from '../data/theni5_words.json';

// Types for Theni 5 (simple strings)
type WordItem = string;

export default function Theni5App() {
    // Data
    const allWords = useMemo(() => theni5Words as WordItem[], []);

    // State
    // Theni 5 typically doesn't have categories/difficulty in the JSON provided (it's just a list).
    // It filters by Range.
    const [rangeStart, setRangeStart] = useState(1);
    const [rangeEnd, setRangeEnd] = useState(250);
    const [filteredWords, setFilteredWords] = useState<WordItem[]>([]);

    // For Theni 5, "slides" are pages of 50 words usually, OR it's just one big list?
    // Looking at theni5.ts logic (implied): usually it displays a grid of words.
    // Let's assume pagination or just one view.
    // "filteredWords" in Theni 5 likely means ALL words in that range?
    // And we display them in a grid.

    // settings
    const [showTimer, setShowTimer] = useState(false); // Timer usually not for reference list? Or maybe it is. 
    // If it's a study aid, maybe no timer. Let's keep it optional but default off.

    // Effect to filtering
    useEffect(() => {
        // Range is inclusive 1-based index
        const s = Math.max(1, rangeStart) - 1;
        const e = Math.min(allWords.length, rangeEnd);

        if (s < allWords.length && s < e) {
            setFilteredWords(allWords.slice(s, e));
        } else {
            setFilteredWords([]);
        }
    }, [rangeStart, rangeEnd, allWords]);

    // Handlers
    const handleApplyRange = (s: number, e: number) => {
        setRangeStart(s);
        setRangeEnd(e);
    };

    // Navigation? Theni 5 usually acts as a Reference Sheet (Grid). 
    // Button "Print" or just view.
    // If it needs navigation (pages), we can implement pagination. 
    // Assuming single scrollable view based on range.

    // Timer?
    useEffect(() => {
        if (showTimer) Timer.restart();
    }, [showTimer]);

    // Render
    return (
        <Fragment>
            <Controls
                categories={[]}
                selectedCategories={[]}
                onToggleCategory={() => { }}
                onToggleAllCategories={() => { }}
                // No difficulty/shuffle usually
                reset={() => { setRangeStart(1); setRangeEnd(250); }}

                // Range
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                onApplyRange={handleApplyRange}

                showTimer={showTimer}
                setShowTimer={setShowTimer}
                timerLabel="Timer"
                progressText={`Showing words ${rangeStart} - ${rangeEnd} (${filteredWords.length} words)`}
            />

            <div id="word-grid" className="word-grid">
                {filteredWords.map((word, idx) => (
                    <div className="grid-item" key={idx}>
                        <div className="grid-number">{rangeStart + idx}</div>
                        <div className="grid-word">{word}</div>
                    </div>
                ))}
            </div>
        </Fragment>
    );
}
