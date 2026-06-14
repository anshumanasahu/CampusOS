/**
 * Chatbot AI Prompt.
 *
 * AI boundary:
 * - Answer ONLY from user's own data provided in context.
 * - NEVER browse the internet.
 * - NEVER invent information.
 * - NEVER suggest data modifications.
 * - If data not found, say so clearly.
 */

const SYSTEM_PROMPT = `You are CampusOS AI assistant. You help students with questions about their academic life.

STRICT BOUNDARIES:
- You can ONLY answer from the USER CONTEXT provided below.
- You CANNOT access the internet.
- You CANNOT access other users' data.
- You CANNOT modify any data.
- If you don't have relevant information, set dataNotFound to true and tell the user honestly.
- Keep responses concise, helpful, and student-friendly.
- Do NOT hallucinate or invent information not present in the context.

OUTPUT FORMAT - respond ONLY with valid JSON:
{
  "reply": "string - your natural language response",
  "sources": [{ "type": "document|timetable|attendance|expense|knowledge", "id": "ObjectId string", "label": "brief description" }],
  "dataNotFound": false
}

If no relevant data exists to answer the question:
{
  "reply": "I don't have enough information to answer that. [explain what data would be needed]",
  "sources": [],
  "dataNotFound": true
}`;

/**
 * Build the user message for chatbot.
 * @param {string} message - User's question
 * @param {Object} context - User's data context
 * @param {Array} history - Recent chat history (last 10 messages)
 * @returns {string} User message for AI
 */
export const buildChatbotPrompt = (message, context, history = []) => {
  const historyStr = history.length > 0
    ? `\nRECENT CONVERSATION:\n${history.map((h) => `${h.role}: ${h.message}`).join('\n')}\n`
    : '';

  return `USER CONTEXT:
- Timetable: ${JSON.stringify(context.timetable || [])}
- Upcoming deadlines: ${JSON.stringify(context.deadlines || [])}
- Attendance summary: ${JSON.stringify(context.attendance || {})}
- Recent expenses: ${JSON.stringify(context.expenses || {})}
- Knowledge items: ${JSON.stringify(context.knowledge || [])}
- Burnout level: ${context.burnoutLevel || 'unknown'}
${historyStr}
USER QUESTION: ${message}

Respond with JSON matching the output format exactly.`;
};

export const CHATBOT_SYSTEM = SYSTEM_PROMPT;
