import { invokeBedrock } from '../ai/bedrock.js';
import { invokeGemini } from '../ai/gemini.js';
import AppError from '../utils/app-error.js';

/**
 * AI Service Orchestrator.
 *
 * Rules (frozen):
 * - Bedrock primary → 1 retry → Gemini fallback → AI_SERVICE_ERROR
 * - Never call both simultaneously
 * - Same JSON output contract for both
 * - Timeout: 10 seconds per call
 * - AI never auto-saves
 */

/**
 * Invoke AI and return raw text response.
 * Handles Bedrock → Gemini fallback chain.
 */
export const invokeAI = async (systemPrompt, userMessage) => {
  // Attempt 1: Bedrock
  try {
    const response = await withTimeout(invokeBedrock(systemPrompt, userMessage), 10000);
    return response;
  } catch (bedrockError1) {
    console.warn('Bedrock attempt 1 failed:', bedrockError1.message);
  }

  // Attempt 2: Bedrock retry
  try {
    const response = await withTimeout(invokeBedrock(systemPrompt, userMessage), 10000);
    return response;
  } catch (bedrockError2) {
    console.warn('Bedrock attempt 2 failed:', bedrockError2.message);
  }

  // Attempt 3: Gemini fallback
  try {
    const response = await withTimeout(invokeGemini(systemPrompt, userMessage), 10000);
    return response;
  } catch (geminiError) {
    console.error('Gemini fallback failed:', geminiError.message);
    throw new AppError(
      'AI service is temporarily unavailable. Please try again or use manual entry.',
      502,
      'AI_SERVICE_ERROR'
    );
  }
};

/**
 * Invoke AI and parse response as JSON.
 * Extracts JSON from markdown code blocks if present.
 */
export const invokeAIJSON = async (systemPrompt, userMessage) => {
  const responseText = await invokeAI(systemPrompt, userMessage);

  try {
    const json = extractJSON(responseText);
    return json;
  } catch (parseError) {
    console.error('AI JSON parse failed. Raw response:', responseText.slice(0, 300));
    throw new AppError(
      'AI returned an invalid response. Please try again or use manual entry.',
      502,
      'AI_SERVICE_ERROR'
    );
  }
};

/**
 * Extract JSON from AI response text.
 * Handles responses wrapped in ```json code blocks,
 * including cases where the JSON content itself contains backtick code blocks.
 */
const extractJSON = (text) => {
  const trimmed = text.trim();

  // Strategy 1: Try parsing the raw text directly (AI returned pure JSON)
  if (trimmed.startsWith('{')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      // Not pure JSON, continue
    }
  }

  // Strategy 2: Find the outermost JSON object using bracket matching
  const jsonStart = trimmed.indexOf('{');
  if (jsonStart !== -1) {
    let depth = 0;
    let inString = false;
    let escape = false;

    for (let i = jsonStart; i < trimmed.length; i++) {
      const char = trimmed[i];

      if (escape) {
        escape = false;
        continue;
      }

      if (char === '\\') {
        escape = true;
        continue;
      }

      if (char === '"' && !escape) {
        inString = !inString;
        continue;
      }

      if (inString) continue;

      if (char === '{') depth++;
      else if (char === '}') {
        depth--;
        if (depth === 0) {
          const jsonStr = trimmed.substring(jsonStart, i + 1);
          try {
            return JSON.parse(jsonStr);
          } catch {
            // Bracket matching found invalid JSON, continue
            break;
          }
        }
      }
    }
  }

  // Strategy 3: Regex fallback for simple cases without nested backticks
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```\s*$/);
  if (codeBlockMatch) {
    return JSON.parse(codeBlockMatch[1].trim());
  }

  throw new Error('No valid JSON found in AI response');
};

/**
 * Wrap a promise with a timeout.
 */
const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`AI call timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]);
};
