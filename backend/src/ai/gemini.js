import env from '../config/env.js';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Invoke Google Gemini as AI fallback.
 * Same contract as Bedrock — takes system prompt + user message, returns text.
 */
export const invokeGemini = async (systemPrompt, userMessage) => {
  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\n${userMessage}` }],
      },
    ],
    generationConfig: {
      maxOutputTokens: 4096,
      temperature: 0.2,
    },
  };

  const response = await fetch(`${GEMINI_URL}?key=${env.geminiApiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('No text content in Gemini response');
  }

  return text;
};
