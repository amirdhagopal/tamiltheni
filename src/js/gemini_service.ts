import { config } from './config';

interface Model {
    name: string;
    supportedGenerationMethods: string[];
}

interface ModelsResponse {
    models: Model[];
}

export const GeminiService = {
    cachedModels: [] as string[],
    failedModels: new Set<string>(),
    apiKey: null as string | null,

    setApiKey(key: string) {
        this.apiKey = key;
    },

    /**
     * Fetches available Flash models and sorts them (non-lite first, then by version)
     */
    async getPrioritizedModels(): Promise<string[]> {
        if (this.cachedModels.length > 0) return this.cachedModels;

        if (!this.apiKey) {
            console.warn('[GeminiService] API key not set, using default model');
            return [config.gemini.defaultModel];
        }

        try {
            const response = await fetch(`${config.gemini.baseUrl}/models?key=${this.apiKey}`);
            if (!response.ok) {
                console.warn('[GeminiService] Failed to fetch models, using default');
                return [config.gemini.defaultModel];
            }

            const data: ModelsResponse = await response.json();

            // Filter for appropriate generation models
            const availableModels = data.models
                .filter(
                    (m) =>
                        (m.name.includes('gemini') || m.name.includes('gemma') || m.name.includes('learnlm')) &&
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
        for (const modelName of models) {
            if (this.failedModels.has(modelName)) continue;

            try {
                console.log(`[GeminiService] Attempting generation with model: ${modelName}`);
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${this.apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                        }),
                    }
                );

                if (response.status === 429) {
                    console.warn(`[GeminiService] Quota exceeded for model ${modelName}. Switching to fallback...`);
                    this.failedModels.add(modelName);
                    continue;
                }

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(
                        `API error (${response.status}): ${errorData.error?.message || response.statusText}`
                    );
                }

                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text) throw new Error('Empty response from Gemini');

                console.log(`[GeminiService] Successfully generated content using: ${modelName}`);
                return text;
            } catch (error: any) {
                if (error.message?.includes('429') || error.message?.toLowerCase().includes('quota')) {
                    continue;
                }
                throw error;
            }
        }

        throw new Error('All available Gemini models have exhausted their quota. Please try again later.');
    },
};
