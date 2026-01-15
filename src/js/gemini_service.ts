/**
 * Gemini API Service
 * Handles dynamic model selection and API calls
 */
import { config } from './config';

interface GeminiModel {
    name: string;
    displayName: string;
    supportedGenerationMethods: string[];
}

interface ModelsResponse {
    models: GeminiModel[];
}

export const GeminiService = {
    cachedModels: [] as string[],
    failedModels: new Set<string>(),
    apiKey: null as string | null,

    setApiKey(key: string): void {
        this.apiKey = key;
    },

    /**
     * Fetches available models and returns the latest Flash model
     */
    async getPrioritizedModels(): Promise<string[]> {
        // Return cached models if available
        if (this.cachedModels.length > 0) {
            return this.cachedModels;
        }

        // Need API key to list models
        if (!this.apiKey) {
            console.log('[GeminiService] No API key, using default model');
            return [config.gemini.defaultModel];
        }

        try {
            const response = await fetch(`${config.gemini.baseUrl}/models?key=${this.apiKey}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data: ModelsResponse = await response.json();

            // Filter for appropriate generation models
            const availableModels = data.models
                .filter(
                    (m) =>
                        m.name.includes('gemini') &&
                        !m.name.includes('tts') &&
                        !m.name.includes('image') &&
                        !m.name.includes('vision') &&
                        !m.name.includes('embedding') &&
                        m.supportedGenerationMethods?.includes('generateContent')
                )
                .sort((a, b) => {
                    const nameA = a.name.toLowerCase();
                    const nameB = b.name.toLowerCase();

                    // 1. Prioritize Flash over Pro
                    const aIsFlash = nameA.includes('flash');
                    const bIsFlash = nameB.includes('flash');
                    if (aIsFlash !== bIsFlash) return aIsFlash ? -1 : 1;

                    // 2. Prioritize non-lite over lite
                    const aIsLite = nameA.includes('lite');
                    const bIsLite = nameB.includes('lite');
                    if (aIsLite !== bIsLite) return aIsLite ? 1 : -1;

                    // 3. Prioritize non-preview/non-exp over experimental
                    const aIsStable = !nameA.includes('preview') && !nameA.includes('exp');
                    const bIsStable = !nameB.includes('preview') && !nameB.includes('exp');
                    if (aIsStable !== bIsStable) return aIsStable ? -1 : 1;

                    // 4. Sort by version number (higher = newer)
                    const versionA = this.extractVersion(a.name);
                    const versionB = this.extractVersion(b.name);
                    return versionB - versionA;
                });

            if (availableModels.length > 0) {
                this.cachedModels = availableModels.map((m) => m.name);
                console.log(`[GeminiService] Full prioritized rotation: ${this.cachedModels.join(', ')}`);
                return this.cachedModels;
            }

            console.warn('[GeminiService] No flash models found, using default');
            return [config.gemini.defaultModel];
        } catch (error) {
            console.error('[GeminiService] Error fetching models:', error);
            return [config.gemini.defaultModel];
        }
    },

    /**
     * Extract version number from model name (e.g., "models/gemini-2.5-flash" -> 2.5)
     */
    extractVersion(modelName: string): number {
        const match = modelName.match(/gemini-(\d+\.?\d*)/);
        return match ? parseFloat(match[1]) : 0;
    },

    /**
     * Generate content using the latest Flash model
     */
    async generateContent(prompt: string): Promise<string> {
        if (!this.apiKey) {
            throw new Error('API key not set');
        }

        const models = await this.getPrioritizedModels();

        // Try models in order
        for (const model of models) {
            // Skip models that have failed in this session
            if (this.failedModels.has(model)) continue;

            try {
                const response = await fetch(`${config.gemini.baseUrl}/${model}:generateContent?key=${this.apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                    }),
                });

                const data = await response.json();

                if (data.error) {
                    const isQuotaError = data.error.message?.includes('quota') || data.error.code === 429;
                    if (isQuotaError) {
                        console.warn(`[GeminiService] Quota exceeded for model ${model}. Switching to fallback...`);
                        this.failedModels.add(model);
                        continue; // Try next model
                    }
                    throw new Error(data.error.message || 'API Error');
                }

                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text) {
                    throw new Error('No response text');
                }

                return text;
            } catch (err: any) {
                // If it's a quota error or network error, we might want to try next model
                // But generally 429 is the main rotation trigger
                if (err.message?.includes('429') || err.message?.toLowerCase().includes('quota')) {
                    console.warn(`[GeminiService] Network/Quota error for ${model}. Trying fallback...`);
                    this.failedModels.add(model);
                    continue;
                }
                throw err; // Rethrow other errors
            }
        }

        throw new Error('All available Gemini models have exhausted their quota. Please try again later.');
    },
};
