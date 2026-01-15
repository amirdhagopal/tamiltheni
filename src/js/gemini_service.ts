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
    cachedModel: null as string | null,
    apiKey: null as string | null,

    setApiKey(key: string): void {
        this.apiKey = key;
    },

    /**
     * Fetches available models and returns the latest Flash model
     */
    async getLatestFlashModel(): Promise<string> {
        // Return cached model if available
        if (this.cachedModel) {
            return this.cachedModel;
        }

        // Need API key to list models
        if (!this.apiKey) {
            console.log('[GeminiService] No API key, using default model');
            return config.gemini.defaultModel;
        }

        try {
            const response = await fetch(`${config.gemini.baseUrl}/models?key=${this.apiKey}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data: ModelsResponse = await response.json();

            // Filter for flash models that support generateContent
            const flashModels = data.models
                .filter(
                    (m) =>
                        m.name.includes('flash') &&
                        !m.name.includes('preview') &&
                        !m.name.includes('lite') &&
                        !m.name.includes('tts') &&
                        !m.name.includes('image') &&
                        m.supportedGenerationMethods?.includes('generateContent')
                )
                .sort((a, b) => {
                    // Sort by version number (higher = newer)
                    const versionA = this.extractVersion(a.name);
                    const versionB = this.extractVersion(b.name);
                    return versionB - versionA;
                });

            if (flashModels.length > 0) {
                this.cachedModel = flashModels[0].name;
                console.log(`[GeminiService] Using latest Flash model: ${this.cachedModel}`);
                return this.cachedModel;
            }

            console.warn('[GeminiService] No flash models found, using default');
            return config.gemini.defaultModel;
        } catch (error) {
            console.error('[GeminiService] Error fetching models:', error);
            return config.gemini.defaultModel;
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

        const model = await this.getLatestFlashModel();

        const response = await fetch(`${config.gemini.baseUrl}/${model}:generateContent?key=${this.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
            }),
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message || 'API Error');
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            throw new Error('No response text');
        }

        return text;
    },
};
