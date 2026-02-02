import { BaseAgent } from './base_agent';
import { GeminiService } from '../gemini_service';
import { Word } from '../../types/index';

export interface SentenceResponse {
    tamil: string;
    en: string;
}

export class SentenceConstructorAgent extends BaseAgent {
    private cache: Record<string, SentenceResponse> = {};

    constructor() {
        super(
            `You are a helpful Tamil language tutor. Your goal is to create simple, grammatically correct Tamil sentences using provided keywords and their contexts.`
        );
    }

    /**
     * Generates a sentence using the two provided words.
     * Includes category and english context to ensure accurate usage.
     */
    async generateSentence(word1: Word, word2: Word, apiKey: string): Promise<SentenceResponse> {
        const cacheKey = `${word1.word_ta}|${word2.word_ta}`;

        if (this.cache[cacheKey]) {
            console.log('[SentenceAgent] Returning cached result');
            return this.cache[cacheKey];
        }

        GeminiService.setApiKey(apiKey);

        const prompt = `
            ${this.systemPrompt}
            
            Generate a simple Tamil sentence using these two specific words:
            1. Word: "${word1.word_ta}" (English: "${word1.word_en}", Category: "${word1.category}")
            2. Word: "${word2.word_ta}" (English: "${word2.word_en}", Category: "${word2.category}")

            POLICY:
            - The generated Tamil sentence MUST include both Exact Tamil words: "${word1.word_ta}" and "${word2.word_ta}".
            - Use the correct context for each word based on its Category. (e.g., if a word refers to a body part, use it in that sense).
            - The generated English translation MUST include the exact English words: "${word1.word_en}" and "${word2.word_en}".
            - Keep the sentence simple, educational, and suitable for learners.

            Provide the response in JSON format: { "tamil": "tamil sentence", "en": "english meaning" }
            IMPORTANT: Provide the COMPLETE sentence. Do NOT truncate or use ellipses (...).
        `;

        try {
            const rawResponse = await this.callLLM(prompt);
            const cleanText = this.cleanJson(rawResponse);
            const json: SentenceResponse = JSON.parse(cleanText);

            if (!json.tamil || !json.en) {
                throw new Error('Invalid response structure from AI');
            }

            this.cache[cacheKey] = json;
            return json;
        } catch (error) {
            console.error('[SentenceAgent] Error generating sentence:', error);
            throw error;
        }
    }
}
