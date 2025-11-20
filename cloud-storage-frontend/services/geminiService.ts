
import { GoogleGenAI } from "@google/genai";

// IMPORTANT: This key is for demonstration purposes. 
// In a real application, this should be handled securely on a backend server.
// For this frontend-only example, we assume process.env.API_KEY is available.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Summarization feature will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const summarizeText = async (textToSummarize: string): Promise<string> => {
  if (!API_KEY) {
    // Simulate a delay and return a mock summary if API key is not available
    return new Promise(resolve => {
      setTimeout(() => {
        resolve("This is a mock summary because the Gemini API key is not configured.");
      }, 1500);
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Summarize the following text in one or two sentences: "${textToSummarize}"`,
      config: {
        systemInstruction: "You are a helpful assistant that provides concise summaries of file content.",
        temperature: 0.5,
      }
    });
    
    const summary = response.text;
    if (!summary) {
        throw new Error("No summary was generated.");
    }
    return summary.trim();

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to generate summary from Gemini API.');
  }
};
