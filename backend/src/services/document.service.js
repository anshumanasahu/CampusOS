import Document from '../models/document.js';
import AppError from '../utils/app-error.js';
import { uploadToS3, deleteFromS3, getSignedFileUrl, generateFileKey } from './storage.service.js';
import { parseDocument } from '../utils/document-parser.js';
import { invokeAIJSON } from './ai.service.js';
import {
  DOCUMENT_EXTRACTION_SYSTEM,
  buildDocumentExtractionPrompt,
} from '../ai/prompts/document-extraction.js';
import { validateRequired, validateEnum, validateObjectId } from '../utils/validators.js';

const VALID_CATEGORIES = [
  'assignment', 'exam', 'placement', 'club_event', 'attendance',
  'scholarship', 'hostel_notice', 'fee_payment', 'transport',
  'personal_reminder', 'other',
];

/**
 * Get all documents for user.
 */
export const getDocuments = async (userId, filters = {}) => {
  const query = { userId };

  if (filters.category) {
    validateEnum(filters.category, VALID_CATEGORIES, 'category');
    query.category = filters.category;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  const documents = await Document.find(query)
    .sort({ createdAt: -1 })
    .select('-extractedData -possibleInfo -manualData')
    .lean();

  return { documents };
};

/**
 * Get a single document by ID (with full data).
 */
export const getDocumentById = async (userId, documentId) => {
  validateObjectId(documentId, 'documentId');

  const document = await Document.findOne({ _id: documentId, userId }).lean();
  if (!document) {
    throw new AppError('Document not found', 404, 'NOT_FOUND');
  }

  // Generate signed URL for file access
  let signedUrl = null;
  try {
    signedUrl = await getSignedFileUrl(document.fileKey);
  } catch {
    // Non-critical — URL generation can fail
  }

  return { document: { ...document, signedUrl } };
};

/**
 * Upload a document, store in S3, parse text, run AI extraction.
 * Returns REVIEW state — does NOT persist extracted data.
 *
 * Flow: Upload → S3 → Parse → AI → REVIEW
 */
export const uploadDocument = async (userId, file) => {
  if (!file) {
    throw new AppError('File is required', 400, 'VALIDATION_ERROR');
  }

  // Step 1: Upload to S3
  const fileKey = generateFileKey(userId, 'documents', file.originalname);
  await uploadToS3(file.buffer, fileKey, file.mimetype);

  // Step 2: Create document record (status: uploaded)
  const document = await Document.create({
    userId,
    fileName: file.originalname,
    fileKey,
    fileType: file.mimetype,
    fileSize: file.size,
    status: 'uploaded',
    source: 'upload',
  });

  // Step 3: Parse text (deterministic, before AI)
  let text;
  try {
    text = await parseDocument(file.buffer, file.mimetype);
  } catch (parseError) {
    // Mark as failed but keep file — user can still use manual fallback
    document.status = 'failed';
    await document.save();
    return {
      document,
      extractedData: null,
      status: 'failed',
      error: parseError.message,
      message: 'Text extraction failed. You can use manual entry instead.',
    };
  }

  // Step 4: AI extraction
  document.status = 'extracting';
  await document.save();

  let aiResult;
  try {
    const userMessage = buildDocumentExtractionPrompt(text, file.originalname, file.mimetype);
    aiResult = await invokeAIJSON(DOCUMENT_EXTRACTION_SYSTEM, userMessage);
  } catch (aiError) {
    // AI failed — still return document in review state with empty extraction
    document.status = 'review';
    document.extractedData = null;
    await document.save();

    return {
      document,
      extractedData: null,
      possibleInfo: null,
      suggestedCategory: null,
      status: 'review',
      aiAvailable: false,
      message: 'AI extraction failed. Please fill in details manually.',
    };
  }

  // Step 5: Store extraction in REVIEW state (not confirmed yet)
  document.status = 'review';
  document.extractedData = aiResult.extractedData || null;
  document.possibleInfo = aiResult.possibleInfo || null;
  document.category = aiResult.suggestedCategory || null;
  await document.save();

  return {
    document,
    extractedData: aiResult.extractedData,
    possibleInfo: aiResult.possibleInfo,
    suggestedCategory: aiResult.suggestedCategory,
    confidence: aiResult.confidence,
    status: 'review',
    aiAvailable: true,
  };
};

/**
 * Confirm document after user review.
 * Saves the user-edited extraction as final data.
 */
export const confirmDocument = async (userId, documentId, data) => {
  validateObjectId(documentId, 'documentId');

  const document = await Document.findOne({ _id: documentId, userId });
  if (!document) {
    throw new AppError('Document not found', 404, 'NOT_FOUND');
  }

  if (document.status === 'confirmed') {
    throw new AppError('Document is already confirmed', 400, 'VALIDATION_ERROR');
  }

  // Accept user-edited fields
  if (data.category) {
    validateEnum(data.category, VALID_CATEGORIES, 'category');
    document.category = data.category;
  }

  if (data.confirmedData) {
    document.extractedData = data.confirmedData;
  }

  document.status = 'confirmed';
  await document.save();

  return { document };
};

/**
 * Reject document extraction.
 * Discards AI output. Optionally removes S3 file.
 */
export const rejectDocument = async (userId, documentId, options = {}) => {
  validateObjectId(documentId, 'documentId');

  const document = await Document.findOne({ _id: documentId, userId });
  if (!document) {
    throw new AppError('Document not found', 404, 'NOT_FOUND');
  }

  if (options.deleteFile) {
    // Remove from S3
    await deleteFromS3(document.fileKey);
    // Remove from DB
    await Document.deleteOne({ _id: documentId });
    return { message: 'Document rejected and deleted' };
  }

  // Keep file but discard extraction
  document.status = 'rejected';
  document.extractedData = null;
  document.possibleInfo = null;
  await document.save();

  return { document, message: 'Extraction rejected. File kept for manual entry.' };
};

/**
 * Create a manual document entry (no file upload, no AI).
 * Manual fallback when parsing or AI fails.
 */
export const createManualDocument = async (userId, data) => {
  validateRequired(data, ['title']);

  if (data.category) {
    validateEnum(data.category, VALID_CATEGORIES, 'category');
  }

  const document = await Document.create({
    userId,
    fileName: 'manual-entry',
    fileKey: `${userId}/documents/manual-${Date.now()}`,
    fileType: 'manual',
    fileSize: 0,
    category: data.category || 'other',
    extractedData: {
      title: data.title,
      dates: data.date ? [{ label: data.label || 'Date', date: data.date }] : [],
      subjects: data.subject ? [data.subject] : [],
      keyInfo: data.description ? [data.description] : [],
    },
    status: 'confirmed',
    source: 'manual',
    manualData: data,
  });

  return { document };
};

/**
 * Delete a document and its S3 file.
 */
export const deleteDocument = async (userId, documentId) => {
  validateObjectId(documentId, 'documentId');

  const document = await Document.findOne({ _id: documentId, userId });
  if (!document) {
    throw new AppError('Document not found', 404, 'NOT_FOUND');
  }

  // Delete from S3 (non-critical)
  if (document.source === 'upload') {
    await deleteFromS3(document.fileKey);
  }

  await Document.deleteOne({ _id: documentId });
  return { message: 'Document deleted' };
};
