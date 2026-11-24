import { Word, Theni5Word } from '../types/index';

let cachedTheniWords: Word[] | null = null;
let cachedTheni5Words: Theni5Word[] | null = null;

/**
 * Asynchronously loads and concatenates the sharded Theni 1-4 word chunks.
 * Keeps individual Rollup chunks well under 500 kB.
 */
export async function loadTheniWords(): Promise<Word[]> {
    if (cachedTheniWords) return cachedTheniWords;

    const [c1, c2, c3] = await Promise.all([
        import('../data/chunks/theni_words_1.json'),
        import('../data/chunks/theni_words_2.json'),
        import('../data/chunks/theni_words_3.json'),
    ]);

    cachedTheniWords = [...(c1.default as Word[]), ...(c2.default as Word[]), ...(c3.default as Word[])];
    return cachedTheniWords;
}

/**
 * Asynchronously loads and concatenates the sharded Theni 5 word chunks.
 */
export async function loadTheni5Words(): Promise<Theni5Word[]> {
    if (cachedTheni5Words) return cachedTheni5Words;

    const [c1, c2] = await Promise.all([
        import('../data/chunks/theni5_words_1.json'),
        import('../data/chunks/theni5_words_2.json'),
    ]);

    cachedTheni5Words = [...(c1.default as Theni5Word[]), ...(c2.default as Theni5Word[])];
    return cachedTheni5Words;
}
