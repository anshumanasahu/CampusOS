import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import AppError from './app-error.js';

/**
 * Document parser — deterministic pre-processing before AI.
 * Extracts text from PDF, DOCX, TXT, CSV files.
 *
 * Rule: Deterministic processing ALWAYS happens before AI call.
 */

/**
 * Parse a file buffer into text based on MIME type.
 * @param {Buffer} buffer - File content
 * @param {string} mimeType - File MIME type
 * @returns {string} Extracted text content
 */
export const parseDocument = async (buffer, mimeType) => {
  switch (mimeType) {
    case 'application/pdf':
      return parsePDF(buffer);

    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return parseDOCX(buffer);

    case 'text/plain':
    case 'text/csv':
      return buffer.toString('utf-8');

    default:
      throw new AppError(
        `Unsupported file type for text extraction: ${mimeType}`,
        400,
        'VALIDATION_ERROR'
      );
  }
};

/**
 * Parse PDF to text.
 */
const parsePDF = async (buffer) => {
  try {
    const result = await pdfParse(buffer);
    if (!result.text || result.text.trim().length === 0) {
      throw new Error('No text content extracted from PDF');
    }
    return result.text;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      'Failed to extract text from PDF. The file may be image-based or corrupted.',
      400,
      'VALIDATION_ERROR'
    );
  }
};

/**
 * Parse DOCX to text.
 */
const parseDOCX = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    if (!result.value || result.value.trim().length === 0) {
      throw new Error('No text content extracted from DOCX');
    }
    return result.value;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      'Failed to extract text from DOCX. The file may be corrupted.',
      400,
      'VALIDATION_ERROR'
    );
  }
};

/**
 * Parse CSV into transaction rows for bank statement processing.
 * Expects columns: date, description/narration, amount (flexible order).
 * @param {string} csvText - Raw CSV content
 * @returns {Array} Parsed transactions [{ date, description, amount }]
 */
export const parseCSVTransactions = (csvText) => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new AppError('CSV file has no data rows', 400, 'VALIDATION_ERROR');
  }

  const header = lines[0].toLowerCase();
  const rows = lines.slice(1);

  // Detect column positions from header
  const columns = header.split(',').map((col) => col.trim());
  const dateCol = columns.findIndex((c) => c.includes('date'));
  const descCol = columns.findIndex((c) =>
    c.includes('description') || c.includes('narration') || c.includes('particular') || c.includes('remark')
  );
  const amountCol = columns.findIndex((c) =>
    c.includes('amount') || c.includes('debit') || c.includes('withdrawal')
  );

  if (dateCol === -1 || descCol === -1 || amountCol === -1) {
    throw new AppError(
      'CSV must have date, description, and amount columns',
      400,
      'VALIDATION_ERROR'
    );
  }

  const transactions = [];
  for (const row of rows) {
    const cells = row.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    if (cells.length <= Math.max(dateCol, descCol, amountCol)) continue;

    const amount = parseFloat(cells[amountCol]);
    if (isNaN(amount) || amount <= 0) continue;

    transactions.push({
      date: cells[dateCol],
      description: cells[descCol],
      amount,
    });
  }

  if (transactions.length === 0) {
    throw new AppError('No valid transactions found in CSV', 400, 'VALIDATION_ERROR');
  }

  return transactions;
};
