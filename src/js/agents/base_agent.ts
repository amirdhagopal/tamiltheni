import { GeminiService } from '../gemini_service';

export abstract class BaseAgent {
    constructor(protected systemPrompt: string) { }

    /**
     * Common method to call GeminiService.
     * Can be overridden or extended by subclasses.
     */
    protected async callLLM(prompt: string): Promise<string> {
        // Here we could prepend the systemPrompt to the user prompt if the API supports it in a specific way,
        // or just rely on the prompt construction in the specific agent.
        // For now, we assume the specific agent constructs the full prompt, potentially using systemPrompt.

        // We might want to pass the systemPrompt here if we change GeminiService to support it explicitly,
        // but currently GeminiService.generateContent takes a single string.
        // So we will just pass the prompt.

        return await GeminiService.generateContent(prompt);
    }

    /**
     * Helper to clean JSON markdown blocks from LLM response
     */
    protected cleanJson(text: string): string {
        return text.replace(/```json\n?|\n?```/g, '').trim();
    }
}
