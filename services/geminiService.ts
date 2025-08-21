import { GoogleGenAI } from "https://esm.sh/@google/genai@0.12.0";
import { SYSTEM_PROMPT } from '../constants';

// The user's environment must provide this variable.
const API_KEY = process.env.API_KEY;

// Initialize the client. The key might be undefined here, but we'll check for it
// before making an API call, which prevents the app from crashing on start.
const ai = new GoogleGenAI({ apiKey: API_KEY });

const formatDate = () => {
    return new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
    });
};

export const streamAnalysis = async (
    userInput: string,
    modelId: string,
    onChunk: (chunk: string) => void,
    onError: (error: string) => void,
    onComplete: () => void
) => {
    try {
        // Check for the API key here, at runtime, instead of on initial load.
        if (!API_KEY) {
            throw new Error("API_KEY is not configured. Please ensure the API_KEY environment variable is set in your environment.");
        }

        const datedSystemPrompt = SYSTEM_PROMPT.replace('[current date]', formatDate());
        const userContent = `Here is the user-provided artifact to analyze:\n\n---\n\n${userInput}`;

        const response = await ai.models.generateContentStream({
            model: modelId,
            contents: userContent,
            config: {
                systemInstruction: datedSystemPrompt,
            },
        });

        for await (const chunk of response) {
            onChunk(chunk.text);
        }

    } catch (err) {
        console.error("Error streaming from Gemini:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        onError(`Failed to generate analysis. Error: ${errorMessage}`);
    } finally {
        onComplete();
    }
};
