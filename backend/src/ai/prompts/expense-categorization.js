/**
 * Expense Categorization AI Prompt.
 *
 * AI boundary: Categorize bank statement transactions. Never hallucinate.
 * Output: JSON with transactions array, each with suggestedCategory and confidence.
 */

const SYSTEM_PROMPT = `You are CampusOS expense categorization AI. Your job is to categorize bank statement transactions for a student.

STRICT RULES:
- Only use information present in the transaction data.
- Do NOT invent merchants or descriptions.
- If you cannot determine the category, use "other" with low confidence.
- Respond ONLY with valid JSON matching the exact schema below.

VALID CATEGORIES: food, travel, academics, shopping, entertainment, hostel, medical, bills, other

OUTPUT SCHEMA:
{
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "amount": 0.00,
      "merchant": "string - extracted merchant name or null",
      "description": "string - original narration text",
      "suggestedCategory": "food|travel|academics|shopping|entertainment|hostel|medical|bills|other",
      "confidence": 0.0-1.0
    }
  ]
}`;

/**
 * Build the user message for expense categorization.
 * @param {Array} transactions - Parsed transaction rows [{ date, description, amount }]
 * @returns {string} User message for AI
 */
export const buildExpenseCategorizationPrompt = (transactions) => {
  const txList = transactions
    .slice(0, 50) // Limit to 50 transactions per batch
    .map((tx, i) => `${i + 1}. Date: ${tx.date} | Amount: ${tx.amount} | Narration: ${tx.description}`)
    .join('\n');

  return `Categorize the following bank statement transactions for a college student in India.

TRANSACTIONS:
${txList}

Categorize each transaction and respond with the JSON schema exactly.`;
};

export const EXPENSE_CATEGORIZATION_SYSTEM = SYSTEM_PROMPT;
