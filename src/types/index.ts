export interface Word {
    id: string | number;
    category: string;
    category_ta: string;
    difficulty: 'D1' | 'D2' | 'D3';
    image_word?: string; // used for image filename
    word_en: string;
    word_ta: string;
    sentence_en?: string;
    sentence_ta?: string;
    complexity?: number;
    clue_words_en?: string;
    clue_words_ta?: string;
}

export interface TheniConfig {
    timerDurations: {
        theni1: number;
        theni2: number;
        theni3: number;
        theni4: number;
        theni5: number;
    };
    gemini: {
        defaultModel: string;
        baseUrl: string;
    };
}

export interface Theni5Word {
    s: number;
    w: string;
}

// Speech Recognition types for browsers
export interface SpeechRecognitionResultItem {
    transcript: string;
    confidence: number;
}

export interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionResultItem;
    length: number;
    isFinal: boolean;
}

export interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    length: number;
}

export interface SpeechRecognitionEventResult {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

export interface SpeechRecognitionErrorEventResult {
    error: string;
    message?: string;
}

export interface SpeechRecognitionInstance {
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    onresult: ((event: SpeechRecognitionEventResult) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEventResult) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
    abort: () => void;
}

export interface SpeechRecognitionConstructor {
    new (): SpeechRecognitionInstance;
}

// Extend Window interface for our global objects
declare global {
    interface Window {
        theniWords: Word[];
        theni5Words: Theni5Word[];
        TheniConfig: TheniConfig;
        TheniUtils: Record<string, unknown>;
        TheniAudio: Record<string, unknown>;
        TheniLayout: Record<string, unknown>;
        TheniTimer: Record<string, unknown>;
        PWAManager: Record<string, unknown>;
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
        webkitAudioContext?: typeof AudioContext;
    }
}
