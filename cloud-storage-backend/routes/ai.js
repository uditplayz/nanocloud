const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

// Prefer a clearly named env var on the server
const API_KEY = process.env.GEMINI_API_KEY || process.env.GENAI_API_KEY || process.env.API_KEY;

let ai = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

// POST /api/ai/summarize
// body: { text: string }
router.post('/summarize', async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ msg: 'Request body must include `text` string.' });
  }

  if (!ai) {
    return res.status(500).json({ msg: 'Server not configured with GEMINI_API_KEY.' });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Summarize the following text in one or two sentences: "${text}"`,
      config: {
        systemInstruction: 'You are a helpful assistant that provides concise summaries of file content.',
        temperature: 0.5,
      }
    });

    const summary = (response && response.text) ? response.text.trim() : '';
    res.json({ summary });
  } catch (err) {
    console.error('AI summarize error:', err);
    res.status(500).json({ msg: 'Failed to generate summary.' });
  }
});

module.exports = router;
