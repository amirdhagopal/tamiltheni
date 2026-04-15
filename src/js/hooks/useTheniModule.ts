import { useState, useEffect, useMemo, useCallback, useRef } from 'preact/hooks';
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
    // Shared State (initialized below with discoverFilters)

    // Derived State: Discovery functions (used for initialization)
    const discoverFilters = useCallback(() => {
        const cats = new Set<string>();
        const years = new Set<string>();
        const rounds = new Set<string>();

        allWords.forEach((w: any) => {
            if (w.year) years.add(String(w.year));
            if (w.round) rounds.add(w.round);
            else rounds.add('முதன்மை');
            if (w.category && w.category_ta) cats.add(`${w.category} - ${w.category_ta}`);
        });

        return {
            categories: Array.from(cats).sort(),
            years: Array.from(years).sort(),
            rounds: Array.from(rounds).sort(),
        };
    }, [allWords]);

    // Shared State with Lazy Initialization
    const [selectedCategories, setSelectedCategories] = useState<string[]>(() => discoverFilters().categories);
    const [selectedYears, setSelectedYears] = useState<string[]>(() => discoverFilters().years);
    const [selectedRounds, setSelectedRounds] = useState<string[]>(() => discoverFilters().rounds);

    const [difficulty, setDifficulty] = useState<'all' | 'D1' | 'D2' | 'D3'>('all');
    const [shuffle, setShuffle] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [showTimer, setShowTimer] = useState(true);

    // Dynamic Discovery (Memoized)
    // Categories are still dynamic: they update when Year/Round selection changes
    const categories = useMemo(() => {
        const cats = new Set<string>();
        allWords.forEach((w: any) => {
            const wordYear = String(w.year || '');
            const matchesYear = selectedYears.includes(wordYear) || !w.year;
            const wordRound = w.round || 'முதன்மை';
            const matchesRound = selectedRounds.includes(wordRound);

            if (matchesYear && matchesRound && w.category && w.category_ta) {
                cats.add(`${w.category} - ${w.category_ta}`);
            }
        });
        return Array.from(cats).sort();
    }, [allWords, selectedYears, selectedRounds]);

    const availableYears = useMemo(() => discoverFilters().years, [discoverFilters]);
    const availableRounds = useMemo(() => {
        const rounds = new Set<string>();
        allWords.forEach((w: any) => {
            const wordYear = String(w.year || '');
            const matchesYear = selectedYears.includes(wordYear) || !w.year;
            if (matchesYear) {
                rounds.add(w.round || 'முதன்மை');
            }
        });
        return Array.from(rounds).sort();
    }, [allWords, selectedYears]);

    // Filter Cascading Logic
    useEffect(() => {
        setSelectedRounds((prev) => {
            const valid = prev.filter((r) => availableRounds.includes(r));
            return valid.length > 0 ? valid : availableRounds;
        });
    }, [availableRounds]);

    useEffect(() => {
        setSelectedCategories((prev) => {
            const valid = prev.filter((c) => categories.includes(c));
            return valid.length > 0 ? valid : categories;
        });
    }, [categories]);

    // Derived State: Filtered Words
    const filteredWords = useMemo(() => {
        let result = allWords;

        if (filterFn) {
            result = filterFn(allWords, { selectedCategories, difficulty, selectedYears, selectedRounds });
        } else {
            result = allWords.filter((w: any) => {
                if (!w.category || !w.difficulty) return true;

                const catKey = `${w.category} - ${w.category_ta}`;
                const matchesCat = selectedCategories.includes(catKey);
                const matchesDiff = difficulty === 'all' || w.difficulty === difficulty;
                const wordYear = String(w.year || '');
                const matchesYear = !w.year || selectedYears.includes(wordYear);
                const wordRound = w.round || 'முதன்மை';
                const matchesRound = selectedRounds.includes(wordRound);

                return matchesCat && matchesDiff && matchesYear && matchesRound;
            });
        }

        if (shuffle) {
            result = [...result];
            Utils.shuffleArray(result);
        }

        return result;
    }, [allWords, selectedCategories, difficulty, shuffle, filterFn, selectedYears, selectedRounds]);

    const isLast = useMemo(() => {
        return filteredWords.length > 0 && currentIndex === filteredWords.length - 1;
    }, [filteredWords.length, currentIndex]);

    // Update index and revealed state when filters change
    const isInitialMount = useRef(true);
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        setCurrentIndex(0);
        setRevealed(false);
        if (onFilterChange) onFilterChange();
    }, [selectedCategories, difficulty, shuffle, selectedYears, selectedRounds]);

    // Progress Update
    useEffect(() => {
        if (!disableProgressUpdate) {
            Utils.updateProgress(currentIndex, filteredWords.length, 'progressBar', 'counter');
        }
        if (onIndexChange) onIndexChange(currentIndex);
    }, [
        currentIndex,
        filteredWords.length,
        disableProgressUpdate,
        selectedCategories,
        selectedYears,
        selectedRounds,
        difficulty,
        shuffle,
    ]);

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

    const toggleYear = useCallback((y: string) => {
        setSelectedYears((prev) => (prev.includes(y) ? prev.filter((x) => x !== y) : [...prev, y]));
    }, []);

    const toggleAllYears = useCallback(() => {
        setSelectedYears((prev) => (prev.length === availableYears.length ? [] : [...availableYears]));
    }, [availableYears]);

    const toggleRound = useCallback((r: string) => {
        setSelectedRounds((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
    }, []);

    const toggleAllRounds = useCallback(() => {
        setSelectedRounds((prev) => (prev.length === availableRounds.length ? [] : [...availableRounds]));
    }, [availableRounds]);

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
        toggleYear,
        toggleAllYears,
        toggleRound,
        toggleAllRounds,
        availableYears,
        availableRounds,
        selectedYears,
        selectedRounds,
        resetSelection,
    };
}
