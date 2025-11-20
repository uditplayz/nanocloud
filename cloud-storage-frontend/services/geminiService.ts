// Frontend -> Backend proxy for AI summarization
// This file calls a backend endpoint (`/api/ai/summarize`) so the API key
// stays on the server. For local dev you can set `VITE_AI_ENDPOINT` to
// override the endpoint.

const API_ENDPOINT = (import.meta as any)?.env?.VITE_AI_ENDPOINT ?? '/api/ai/summarize';

const mockSummary = (text: string) => {
  return `(mock) ${text.slice(0, 120)}${text.length > 120 ? '…' : ''}`;
};

export const summarizeText = async (textToSummarize: string): Promise<string> => {
  if (!textToSummarize) return '';

  // If no backend configured, return a mock summary after a short delay
  if (!API_ENDPOINT) {
    return new Promise(resolve => setTimeout(() => resolve(mockSummary(textToSummarize)), 800));
  }

  try {
    const resp = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textToSummarize }),
    });

    if (!resp.ok) {
      // Fallback to mock summary when proxy is not available or returns error
      console.warn('AI proxy returned non-OK response', resp.status);
      return mockSummary(textToSummarize);
    }

    const data = await resp.json();
    if (data && data.summary) return data.summary;

    return mockSummary(textToSummarize);
  } catch (err) {
    console.error('Error calling AI proxy:', err);
    return mockSummary(textToSummarize);
  }
};
