export interface Word {
    id: string | number;
    category: string;
    category_ta: string;
    difficulty: "D1" | "D2" | "D3";
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

// Extend Window interface for our global objects (for now, until we fully modularize)
declare global {
    interface Window {
        theniWords: Word[];
        theni5Words: Theni5Word[];
        TheniConfig: TheniConfig;
        TheniUtils: any;
        TheniAudio: any;
        TheniLayout: any;
        TheniTimer: any;
        PWAManager: any;
    }
}
