import { BaseAgent } from './base_agent';
import { GeminiService } from '../gemini_service';

export interface SentenceResponse {
    tamil: string;
    english: string;
}

export class SentenceConstructorAgent extends BaseAgent {
    private cache: Record<string, SentenceResponse> = {};

    constructor() {
        super(
            `You are a helpful Tamil language tutor. Your goal is to create simple, grammatically correct Tamil sentences using provided keywords.`
        );
    }

    /**
     * Generates a sentence using the two provided words.
     * Checks cache first.
     */
    async generateSentence(word1: string, word2: string, apiKey: string): Promise<SentenceResponse> {
        const cacheKey = `${word1}|${word2}`;

        if (this.cache[cacheKey]) {
            console.log('[SentenceAgent] Returning cached result');
            return this.cache[cacheKey];
        }

        // Set the API key on the service (ensuring we use the one provided for this call/session)
        GeminiService.setApiKey(apiKey);

        const prompt = `
            ${this.systemPrompt}
            
            Generate a simple Tamil sentence using these two words: "${word1}" and "${word2}".
            Provide the response in JSON format: { "tamil": "tamil sentence", "english": "english meaning" }
            IMPORTANT: Use the exact Tamil words provided if possible, or their correct declensions. Keep the sentence simple and suitable for learners.
        `;

        try {
            const rawResponse = await this.callLLM(prompt);
            const cleanText = this.cleanJson(rawResponse);
            const json: SentenceResponse = JSON.parse(cleanText);

            // Validate structure
            if (!json.tamil || !json.english) {
                throw new Error('Invalid response structure from AI');
            }

            // Cache the valid result
            this.cache[cacheKey] = json;
            return json;

        } catch (error) {
            console.error('[SentenceAgent] Error generating sentence:', error);
            throw error;
        }
    }
}
