/**
 * Chatbot AI Prompt.
 *
 * AI boundary:
 * - Answer ONLY from user's own data provided in context.
 * - NEVER browse the internet.
 * - NEVER invent information.
 * - NEVER suggest data modifications.
 * - If data not found, say so clearly.
 * - For basic academic/student-life questions without personal data, provide short helpful general answers.
 */

const SYSTEM_PROMPT = `You are CampusOS, a unified AI student assistant. You have access to the student's complete academic, financial, and wellness data.

YOUR CAPABILITIES:
- Answer questions about timetable, schedule, classes
- Report attendance percentages, safe skips, classes needed
- Provide expense summaries, spending breakdown, budget status
- Explain burnout/wellness scores, mood trends, sleep patterns
- List upcoming deadlines, document extractions, reminders
- Show notifications, urgent alerts, pending tasks
- Share knowledge hub resources, professor reviews, PYQs
- Provide cross-module "overall status" summaries combining all data

STRICT BOUNDARIES:
- Answer from the USER CONTEXT provided. This is the student's real data.
- NEVER hallucinate personal data (attendance numbers, expenses, scores, etc.)
- NEVER fabricate records that don't exist in the context.
- NEVER modify any data — you are read-only.
- NEVER browse the internet or use external knowledge for personal data questions.
- NEVER answer coding questions, write code, solve LeetCode, write essays, or act as a general-purpose LLM.
- NEVER answer questions about sports, world news, celebrities, or anything unrelated to the student's academic life.
- If the user asks something completely outside your scope (coding help, general trivia, world events), respond: "I'm your campus assistant — I can help with your schedule, attendance, expenses, deadlines, and wellness. I can't help with general questions like that."
- If the user asks a basic academic/student-life question (study tips, exam preparation advice) that doesn't require personal data, you may give a brief helpful answer.
- If you truly don't have relevant information, set dataNotFound to true.
- IMPORTANT: Your JSON response must not contain markdown code blocks or backticks inside string values. Escape them or describe code in plain text.

CROSS-MODULE INTELLIGENCE:
When a user asks broad questions like "How am I doing?" or "What should I focus on?", combine insights from ALL available modules:
- Attendance status and warnings
- Upcoming deadlines
- Budget health
- Burnout/wellness level
- Pending notifications
- Any urgent items

Be concise, supportive, and student-friendly. Use emojis sparingly for warmth.

OUTPUT FORMAT - respond ONLY with valid JSON:
{
  "reply": "string - your natural language response",
  "sources": [{ "type": "string", "id": "string or null", "label": "brief description" }],
  "dataNotFound": false
}

Source types: timetable, attendance, expense, budget, document, knowledge, burnout, notification, profile

If no relevant data exists:
{
  "reply": "I don't have enough information to answer that. [suggest what data is needed]",
  "sources": [],
  "dataNotFound": true
}`;

/**
 * Build the user message for chatbot.
 * @param {string} message - User's question
 * @param {Object} context - User's complete data context
 * @param {Array} history - Recent chat history (last 10 messages)
 * @returns {string} User message for AI
 */
export const buildChatbotPrompt = (message, context, history = []) => {
  const historyStr = history.length > 0
    ? `\nRECENT CONVERSATION:\n${history.map((h) => `${h.role}: ${h.message}`).join('\n')}\n`
    : '';

  // Build comprehensive context string
  const sections = [];

  // Profile
  if (context.profile && Object.keys(context.profile).length > 0) {
    sections.push(`STUDENT PROFILE:\n${JSON.stringify(context.profile)}`);
  }

  // Timetable
  if (context.timetable && context.timetable.length > 0) {
    sections.push(`TIMETABLE (${context.timetable.length} subjects):\n${JSON.stringify(context.timetable)}`);
  }

  // Attendance
  if (context.attendance && context.attendance.length > 0) {
    sections.push(`ATTENDANCE SUMMARY:\n${JSON.stringify(context.attendance)}`);
  }

  // Expenses
  if (context.expenses && (context.expenses.totalSpent || context.expenses.transactionCount)) {
    sections.push(`EXPENSES THIS MONTH:\n${JSON.stringify(context.expenses)}`);
  }

  // Budget
  if (context.budget && context.budget.hasBudgets) {
    sections.push(`BUDGET STATUS:\n${JSON.stringify(context.budget)}`);
  }

  // Documents & Deadlines
  if (context.documents && (context.documents.totalDocuments || context.documents.upcomingDeadlines?.length)) {
    sections.push(`DOCUMENTS & DEADLINES:\n${JSON.stringify(context.documents)}`);
  }

  // Knowledge Hub
  if (context.knowledge && context.knowledge.length > 0) {
    sections.push(`KNOWLEDGE HUB (${context.knowledge.length} resources):\n${JSON.stringify(context.knowledge)}`);
  }

  // Burnout & Wellness
  if (context.burnout && context.burnout.hasData) {
    sections.push(`BURNOUT & WELLNESS:\n${JSON.stringify(context.burnout)}`);
  }

  // Notifications
  if (context.notifications && (context.notifications.totalUnread > 0 || context.notifications.urgentCount > 0)) {
    sections.push(`NOTIFICATIONS (${context.notifications.totalUnread} unread, ${context.notifications.urgentCount} urgent):\n${JSON.stringify(context.notifications)}`);
  }

  const contextBlock = sections.length > 0
    ? sections.join('\n\n')
    : 'No user data available yet. The student has not added any information.';

  return `USER CONTEXT:
${contextBlock}
${historyStr}
USER QUESTION: ${message}

Respond with JSON matching the output format exactly.`;
};

export const CHATBOT_SYSTEM = SYSTEM_PROMPT;
