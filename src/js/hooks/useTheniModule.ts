import { useState, useEffect, useMemo, useCallback } from 'preact/hooks';
import { Utils } from '../utils';
import { Timer } from '../timer';

interface UseTheniModuleProps<T> {
    allWords: T[];
    initialTimerDuration?: number;
    filterFn?: (words: T[], state: any) => T[];
    onIndexChange?: (index: number) => void;
    onFilterChange?: () => void;
    disableProgressUpdate?: boolean;
    disableShortcuts?: boolean;
}

export function useTheniModule<T extends { difficulty?: string; category?: string; category_ta?: string } | any>({
    allWords,
    initialTimerDuration = 10,
    filterFn,
    onIndexChange,
    onFilterChange,
    disableProgressUpdate = false,
    disableShortcuts = false,
}: UseTheniModuleProps<T>) {
    // Shared State
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [difficulty, setDifficulty] = useState<'all' | 'D1' | 'D2' | 'D3'>('all');
    const [shuffle, setShuffle] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [showTimer, setShowTimer] = useState(true);

    // Derived State: Categories
    const categories = useMemo(() => {
        const cats = new Set<string>();
        allWords.forEach((w: any) => {
            if (w.category && w.category_ta) {
                cats.add(`${w.category} - ${w.category_ta}`);
            }
        });
        return Array.from(cats);
    }, [allWords]);

    // Initial Category Selection
    useEffect(() => {
        if (categories.length > 0 && selectedCategories.length === 0) {
            setSelectedCategories([...categories]);
        }
    }, [categories]);

    // Derived State: Filtered Words
    const filteredWords = useMemo(() => {
        let result = allWords;

        if (filterFn) {
            result = filterFn(allWords, { selectedCategories, difficulty });
        } else {
            result = allWords.filter((w: any) => {
                // If it doesn't have category/difficulty, include it (it's likely Theni 5 or similar handled externally)
                if (!w.category || !w.difficulty) return true;

                const catKey = `${w.category} - ${w.category_ta}`;
                const matchesCat = selectedCategories.length > 0 && selectedCategories.includes(catKey);
                const matchesDiff = difficulty === 'all' || w.difficulty === difficulty;
                return matchesCat && matchesDiff;
            });
        }

        if (shuffle) {
            result = [...result];
            Utils.shuffleArray(result);
        }

        return result;
    }, [allWords, selectedCategories, difficulty, shuffle, filterFn]);

    const isLast = useMemo(() => {
        return filteredWords.length > 0 && currentIndex === filteredWords.length - 1;
    }, [filteredWords.length, currentIndex]);

    // Update index and revealed state when filters change
    useEffect(() => {
        setCurrentIndex(0);
        setRevealed(false);
        if (onFilterChange) onFilterChange();
    }, [selectedCategories, difficulty, shuffle]);

    // Progress Update
    useEffect(() => {
        if (!disableProgressUpdate) {
            Utils.updateProgress(currentIndex, filteredWords.length, 'progressBar', 'counter');
        }
        if (onIndexChange) onIndexChange(currentIndex);
    }, [currentIndex, filteredWords.length, disableProgressUpdate]);

    // Timer Init
    useEffect(() => {
        Timer.init(initialTimerDuration);
    }, [initialTimerDuration]);

    // Timer Visibility
    useEffect(() => {
        const pill = document.getElementById('timerPill');
        if (showTimer) {
            pill?.style.removeProperty('display');
        } else if (pill) {
            pill.style.display = 'none';
        }
    }, [showTimer]);

    // Timer Restart on slide change
    useEffect(() => {
        if (showTimer) Timer.restart();
    }, [currentIndex, showTimer, filteredWords.length]);

    // Navigation Handlers
    const handleNext = useCallback(() => {
        if (currentIndex < filteredWords.length - 1) {
            setCurrentIndex((c) => c + 1);
            setRevealed(false);
            document.dispatchEvent(new CustomEvent('requestPanelCollapse'));
        }
    }, [currentIndex, filteredWords.length]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex((c) => c - 1);
            setRevealed(false);
            document.dispatchEvent(new CustomEvent('requestPanelCollapse'));
        }
    }, [currentIndex]);

    const handleGoFirst = useCallback(() => {
        setCurrentIndex(0);
        setRevealed(false);
        document.dispatchEvent(new CustomEvent('requestPanelCollapse'));
    }, []);

    const handleGoLast = useCallback(() => {
        setCurrentIndex(Math.max(0, filteredWords.length - 1));
        setRevealed(false);
        document.dispatchEvent(new CustomEvent('requestPanelCollapse'));
    }, [filteredWords.length]);

    const handleAction = useCallback(
        (onAdvance?: () => void) => {
            if (!revealed) {
                setRevealed(true);
            } else {
                handleNext();
                if (onAdvance) onAdvance();
            }
        },
        [revealed, handleNext]
    );

    const toggleCategory = useCallback((c: string) => {
        setSelectedCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
    }, []);

    const toggleAllCategories = useCallback(() => {
        setSelectedCategories((prev) => (prev.length === categories.length ? [] : [...categories]));
    }, [categories]);

    const resetSelection = useCallback(() => {
        setShuffle(false);
        setCurrentIndex(0);
        setRevealed(false);
    }, []);

    // Keyboard Shortcuts
    useEffect(() => {
        if (disableShortcuts) return;

        const handleKey = (e: KeyboardEvent) => {
            if ((e.target as HTMLElement).tagName === 'INPUT') return;
            switch (e.key) {
                case 'ArrowLeft':
                    handlePrev();
                    break;
                case 'ArrowRight':
                    handleAction();
                    break;
                case ' ':
                    e.preventDefault();
                    handleAction();
                    break;
                case 'Enter':
                    handleAction();
                    break;
                case 'Home':
                case '[':
                    handleGoFirst();
                    break;
                case 'End':
                case ']':
                    handleGoLast();
                    break;
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handlePrev, handleAction, handleGoFirst, handleGoLast, disableShortcuts]);

    return {
        // State
        selectedCategories,
        setSelectedCategories,
        difficulty,
        setDifficulty,
        shuffle,
        setShuffle,
        currentIndex,
        setCurrentIndex,
        revealed,
        setRevealed,
        audioEnabled,
        setAudioEnabled,
        voiceEnabled,
        setVoiceEnabled,
        showTimer,
        setShowTimer,
        filteredWords,
        currentWord: filteredWords[currentIndex] || null,
        categories,
        isLast,

        // Handlers
        handleNext,
        handlePrev,
        handleGoFirst,
        handleGoLast,
        handleAction,
        toggleCategory,
        toggleAllCategories,
        resetSelection,
    };
}
