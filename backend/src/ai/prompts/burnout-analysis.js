/**
 * Burnout Analysis AI Prompt.
 *
 * AI boundary: Analyze wellness data. Read-only insights. Never modify data.
 * Output: JSON with score, level, contributors, suggestions.
 */

const SYSTEM_PROMPT = `You are CampusOS wellness AI. You analyze student wellbeing data to detect burnout patterns.

STRICT RULES:
- Base your analysis ONLY on the provided data.
- Do NOT hallucinate patterns not supported by the data.
- Be empathetic but factual.
- Respond ONLY with valid JSON matching the exact schema below.
- If data is insufficient, provide conservative estimates.

OUTPUT SCHEMA:
{
  "score": 0-100,
  "level": "low|medium|high",
  "contributors": [
    { "factor": "sleep|workload|mood|missed_tasks|spending", "impact": "low|medium|high", "detail": "string - brief explanation" }
  ],
  "suggestions": ["string - actionable suggestion"]
}

SCORING GUIDE:
- 0-30: low burnout
- 31-60: medium burnout
- 61-100: high burnout`;

/**
 * Build the user message for burnout analysis.
 * @param {Array} records - Recent burnout check-in records
 * @param {number} pendingTasksCount - Number of pending deadlines
 * @param {boolean} lateNightSpending - Whether late-night spending detected
 * @returns {string} User message for AI
 */
export const buildBurnoutAnalysisPrompt = (records, pendingTasksCount, lateNightSpending) => {
  const summary = records.slice(0, 30).map((r) => ({
    date: r.date,
    mood: `${r.mood}/5`,
    sleep: `${r.sleepHours}h`,
    workload: `${r.workloadEstimate}/5`,
  }));

  return `Analyze burnout risk for this student based on their wellness data.

WELLNESS LOGS (last ${records.length} entries):
${JSON.stringify(summary, null, 2)}

ADDITIONAL CONTEXT:
- Pending tasks/deadlines: ${pendingTasksCount}
- Late-night spending detected: ${lateNightSpending ? 'yes' : 'no'}

Provide burnout score, level, contributing factors, and suggestions.`;
};

export const BURNOUT_ANALYSIS_SYSTEM = SYSTEM_PROMPT;
