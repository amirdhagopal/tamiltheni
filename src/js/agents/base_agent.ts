import { GeminiService } from '../gemini_service';

export abstract class BaseAgent {
    constructor(protected systemPrompt: string) { }

    /**
     * Common method to call GeminiService.
     * Can be overridden or extended by subclasses.
     */
    protected async callLLM(prompt: string): Promise<string> {
        let attempts = 0;
        const maxRetries = 3;

        while (attempts < maxRetries) {
            try {
                return await GeminiService.generateContent(prompt);
            } catch (error: any) {
                attempts++;
                const isOverloaded = error.message?.toLowerCase().includes('overloaded') ||
                    error.message?.includes('503') ||
                    error.message?.includes('429');

                if (isOverloaded && attempts < maxRetries) {
                    const waitTime = Math.pow(2, attempts - 1) * 1000; // 1s, 2s, 4s...
                    console.warn(`[BaseAgent] Model overloaded. Retrying in ${waitTime}ms... (Attempt ${attempts})`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    continue;
                }

                throw error; // Rethrow if not retryable or max retries reached
            }
        }
        throw new Error('Max retries exceeded');
    }

    /**
     * Helper to clean JSON markdown blocks from LLM response
     */
    protected cleanJson(text: string): string {
        return text.replace(/```json\n?|\n?```/g, '').trim();
    }
}
